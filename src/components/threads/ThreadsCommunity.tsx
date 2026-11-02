"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { ArrowDown, ArrowRight, BookOpen, Bookmark, Brain, Check, ChevronDown, ChevronRight, FolderClosed, Heart, ImagePlus, Leaf, Link2, MessageCircle, MoreHorizontal, PencilLine, Send, ShieldCheck, Sparkles, ThumbsDown, TrendingUp, Users, X } from "lucide-react";
import { BotanicalSprig, CommunityFooterTear, CommunityTexture, DemoAvatar, PaperPin, PaperSurface, PaperTape } from "./ThreadPaper";
import { COMMUNITY_GUIDELINES, THREAD_TOPICS, type CommunityPost, type ThreadTopic } from "./threads-demo-data";
import styles from "./ThreadsCommunity.module.css";

const TOPIC_ICONS = { Mindset: Brain, Progress: TrendingUp, Learning: BookOpen, Life: Leaf, Community: Users };
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm";
type Sort = "latest" | "liked" | "discussed" | "saved";
type Attachment = { file: File; url: string };
type GuestDetails = { name: string; email: string; isAnonymous: boolean };

type ThreadsCommunityProps = {
  query: string;
  onQueryChange: (query: string) => void;
  draft: string;
  onDraftChange: (draft: string) => void;
  onWrite: () => void;
};

export function ThreadsCommunity({ query, onQueryChange, draft, onDraftChange, onWrite }: ThreadsCommunityProps) {
  const textureId = `community-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [topic, setTopic] = useState<ThreadTopic | null>(null);
  const [sort, setSort] = useState<Sort>("latest");
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const guidelines = useRef<HTMLDialogElement>(null);
  const objectUrls = useRef(new Set<string>());

  const loadPosts = useCallback(async () => {
    try {
      const response = await fetch("/api/threads", { cache: "no-store" });
      const data = await response.json() as { posts?: CommunityPost[]; signedIn?: boolean; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Unable to load Threads.");
      setPosts(data.posts ?? []);
      setSignedIn(Boolean(data.signedIn));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to load Threads.");
    }
  }, []);

  useEffect(() => { void loadPosts(); }, [loadPosts]);

  useEffect(() => {
    const urls = objectUrls.current;
    return () => { urls.forEach((url) => URL.revokeObjectURL(url)); urls.clear(); };
  }, []);

  const visiblePosts = useMemo(() => {
    const term = query.trim().toLowerCase();
    return posts.filter((post) => (!topic || post.topic === topic)
      && (!term || `${post.title} ${post.body} ${post.topic} ${post.author}`.toLowerCase().includes(term))
      && (sort !== "saved" || post.saved))
      .sort((a, b) => sort === "liked" ? b.likes - a.likes : sort === "discussed" ? b.commentCount - a.commentCount : b.order - a.order);
  }, [posts, query, sort, topic]);

  function removeAttachment() {
    if (attachment) { URL.revokeObjectURL(attachment.url); objectUrls.current.delete(attachment.url); }
    setAttachment(null);
    if (fileInput.current) fileInput.current.value = "";
  }

  function chooseAttachment(file: File | undefined) {
    setError("");
    if (!file) return;
    if (!ACCEPT.split(",").includes(file.type)) { setError("Choose a JPG, PNG, WebP, GIF, MP4, or WebM file."); return; }
    const limit = file.type.startsWith("video/") ? 50 : 10;
    if (file.size > limit * 1024 * 1024) { setError(`Choose a file smaller than ${limit} MB.`); return; }
    removeAttachment();
    const url = URL.createObjectURL(file);
    objectUrls.current.add(url);
    setAttachment({ file, url });
  }

  async function postThread(event: FormEvent) {
    event.preventDefault();
    const body = draft.trim();
    if (!body && !attachment) return;
    const payload = new FormData();
    payload.set("action", "post");
    payload.set("body", body);
    if (attachment) payload.set("attachment", attachment.file);
    const response = await fetch("/api/threads", { method: "POST", body: payload });
    const data = await response.json().catch(() => ({})) as { error?: string };
    if (response.status === 401) { window.location.assign("/login?next=/threads"); return; }
    if (!response.ok) { setError(data.error ?? "Unable to publish your thread."); return; }
    onDraftChange(""); onQueryChange(""); setSort("latest"); removeAttachment(); setNotice("Your thread has been shared with the community.");
    void loadPosts();
  }

  function updatePost(id: string, update: (post: CommunityPost) => CommunityPost) {
    setPosts((current) => current.map((post) => post.id === id ? update(post) : post));
  }

  function selectTopic(next: ThreadTopic | null) {
    setTopic((current) => current === next ? null : next);
    onQueryChange("");
    setSort("latest");
  }

  async function addComment(id: string, text: string, parentId: string | null, guest?: GuestDetails) {
    if (guest) {
      const registration = await fetch("/api/threads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "register-commenter", ...guest }) });
      const registrationData = await registration.json().catch(() => ({})) as { error?: string };
      if (!registration.ok) { setError(registrationData.error ?? "Unable to save your details."); return; }
    }
    const response = await fetch("/api/threads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "reply", body: text, postId: id, parentId: parentId ?? id, ...(guest ? { isAnonymous: guest.isAnonymous } : {}) }) });
    const data = await response.json().catch(() => ({})) as { error?: string };
    if (response.status === 401) { window.location.assign("/login?next=/threads"); return; }
    if (!response.ok) { setError(data.error ?? "Unable to publish your reply."); return; }
    setNotice("Your reply has been shared.");
    void loadPosts();
  }

  async function reactToPost(id: string, value: 1 | -1 | null) {
    const response = await fetch("/api/threads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "vote", entryId: id, value }) });
    if (response.status === 401) { window.location.assign("/login?next=/threads"); return; }
    if (!response.ok) { setError("Unable to save your reaction."); return; }
    void loadPosts();
  }

  async function deletePost(id: string, isComment = false) {
    if (!window.confirm(`Delete this ${isComment ? "comment" : "thread"}? This cannot be undone.`)) return;
    const response = await fetch("/api/threads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete", entryId: id }) });
    const data = await response.json().catch(() => ({})) as { error?: string };
    if (response.status === 401) { window.location.assign("/login?next=/threads"); return; }
    if (!response.ok) { setError(data.error ?? "Unable to delete this thread."); return; }
    setNotice("Your thread has been deleted.");
    void loadPosts();
  }

  async function reportComment(entryId: string) {
    const response = await fetch("/api/threads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "report", entryId }) });
    const data = await response.json().catch(() => ({})) as { error?: string };
    if (response.status === 401) { window.location.assign("/login?next=/threads"); return; }
    if (!response.ok) { setError(data.error ?? "Unable to send the report."); return; }
    setNotice("Thanks — this comment has been reported to the MyMentor admin team.");
  }

  function resetFilters() { setTopic(null); setSort("latest"); onQueryChange(""); }

  return <section id="threads-community" className={styles.community} style={{ "--community-grain": `url(#${textureId}-grain)`, "--community-fibres": `url(#${textureId}-fibres)` } as CSSProperties} aria-label="The community conversation board">
    <CommunityTexture id={textureId} />
    <div className={styles.boardLayout}>
      <aside className={styles.leftRail} aria-label="Community tools">
        <section className={styles.invitation}>
          <PaperSurface seed={21} /><PaperPin className={styles.invitationPin} />
          <div className={styles.invitationContent}>
            <span className={styles.newThread}><Sparkles size={15} strokeWidth={1.5} />New Thread</span>
            <h2>Start a<br />conversation</h2>
            <p>Share a question, experience<br className={styles.desktopBreak} /> or thought with the community.<br className={styles.desktopBreak} /> Your story might help someone<br className={styles.desktopBreak} /> today.</p>
            <button type="button" className={styles.greenButton} onClick={onWrite}><PencilLine size={19} /><span>Write a thread</span><ArrowRight size={17} /></button>
          </div>
          <BotanicalSprig className={styles.invitationLeaves} />
        </section>

        <nav className={styles.topicPanel} aria-label="Browse conversations by topic">
          <button type="button" className={styles.topicHeading} onClick={resetFilters} aria-label="Browse all topics"><FolderClosed size={21} strokeWidth={1.5} /><span>Browse by topic</span></button>
          <div className={styles.topicList}>{THREAD_TOPICS.map(({ name, count }) => {
            const Icon = TOPIC_ICONS[name];
            return <button type="button" key={name} className={styles.topicRow} data-featured={name === "Progress"} aria-pressed={topic === name} onClick={() => selectTopic(name)}><Icon size={20} strokeWidth={1.6} /><span>{name}</span><span className={styles.topicCount}>{count}</span><ChevronRight size={15} /></button>;
          })}</div>
        </nav>

        <section className={styles.kindness} id="community-rules">
          <PaperSurface seed={53} warm /><PaperPin className={styles.kindnessPin} />
          <div className={styles.kindnessContent}>
            <h2><ShieldCheck size={31} strokeWidth={1.4} /><span>A kinder community</span></h2>
            <p>Be kind. Share honestly.<br />Respect different perspectives.<br />Keep it safe and supportive<br />for everyone.</p>
            <svg className={styles.heartDoodle} viewBox="0 0 64 60" aria-hidden="true"><path d="M31 49C14 36 4 27 7 15c4-12 19-10 25 1 6-14 21-15 25-3 5 13-12 27-26 36Z" /></svg>
            <button type="button" className={styles.guidelinesLink} onClick={() => guidelines.current?.showModal()}>Read our community guidelines<ArrowRight size={17} /></button>
          </div>
          <BotanicalSprig className={styles.kindnessLeaves} />
        </section>
      </aside>

      <div className={styles.mainColumn}>
        <form id="thread-composer" onSubmit={postThread} className={styles.composer}>
          <PaperSurface seed={60} /><PaperTape className={styles.composerTape} /><BotanicalSprig className={styles.composerLeaves} />
          <div className={styles.composerContent}>
            <label htmlFor="thread-body">What’s on your mind?</label>
            <textarea id="thread-body" value={draft} onChange={(event) => onDraftChange(event.target.value)} placeholder="Share a question, experience, or a moment from your journey..." rows={4} maxLength={3000} required={!attachment} />
            {attachment && <div className={styles.attachmentPreview}>
              {attachment.file.type.startsWith("video/") ? <video src={attachment.url} controls /> : <img src={attachment.url} alt="Your attachment preview" />}
              <button type="button" onClick={removeAttachment} aria-label="Remove attachment"><X size={19} /></button><span>{attachment.file.name}</span>
            </div>}
            <div className={styles.composerActions}>
              <button type="button" className={styles.attachButton} onClick={() => fileInput.current?.click()}><ImagePlus size={23} strokeWidth={1.6} /><span>Photo / video</span></button>
              <input ref={fileInput} type="file" accept={ACCEPT} onChange={(event) => chooseAttachment(event.target.files?.[0])} className={styles.visuallyHidden} aria-label="Attach a photo or video" />
              <button type="submit" className={styles.greenButton}>Post thread<ArrowRight size={17} /></button>
            </div>
            {error && <p className={styles.error} role="alert">{error}</p>}
          </div>
        </form>

        {notice && <p className={styles.notice} role="status"><Check size={17} />{notice}<button type="button" aria-label="Dismiss message" onClick={() => setNotice("")}><X size={15} /></button></p>}

        <div className={styles.feedToolbar} id="threads-conversations">
          <h2>{query ? "Search results" : topic ? `${topic} conversations` : sort === "saved" ? "Saved conversations" : "Latest conversations"}</h2>
          <label className={styles.sortControl}><span className={styles.visuallyHidden}>Sort conversations</span><select value={sort} onChange={(event) => setSort(event.target.value as Sort)}><option value="latest">Latest</option><option value="liked">Most liked</option><option value="discussed">Most discussed</option><option value="saved">Saved</option></select><ChevronDown size={15} /></label>
        </div>
        {(query || topic) && <div className={styles.filterSummary}><span>{visiblePosts.length} conversation{visiblePosts.length === 1 ? "" : "s"}{query ? ` matching “${query}”` : ` about ${topic}`}</span><button type="button" onClick={resetFilters}>Clear filters<X size={13} /></button></div>}

        <div className={styles.feed} aria-live="polite" aria-relevant="additions removals">
          {visiblePosts.map((post, index) => <ConversationCard key={post.id} post={post} index={index}
            onLike={() => void reactToPost(post.id, post.liked ? null : 1)}
            onDislike={() => void reactToPost(post.id, post.disliked ? null : -1)}
            onSave={() => updatePost(post.id, (current) => ({ ...current, saved: !current.saved }))}
            onComment={(text, parentId) => void addComment(post.id, text, parentId)}
            signedIn={signedIn}
            onDelete={post.canDelete ? () => void deletePost(post.id) : undefined}
            onDeleteComment={(entryId) => void deletePost(entryId, true)}
            onReactComment={(entryId, liked) => void reactToPost(entryId, liked ? null : 1)}
            onReportComment={(entryId) => void reportComment(entryId)}
            onHide={() => { setPosts((current) => current.filter((item) => item.id !== post.id)); setNotice("Conversation hidden in this demo session."); }}
            onCopy={async () => {
              try { await navigator.clipboard.writeText(`${window.location.origin}/threads#conversation-${post.id}`); setNotice("Conversation link copied."); }
              catch { setNotice("Your browser could not copy the link. You can use the conversation’s address in the URL bar."); }
            }} />)}
          {!visiblePosts.length && <div className={styles.emptyState}><PaperSurface seed={91} /><div><MessageCircle size={32} strokeWidth={1.3} /><h3>{sort === "saved" ? "Keep a little inspiration close." : "There’s room for your conversation."}</h3><p>{sort === "saved" ? "Save a thread to find it here later." : "Try another topic, or be the first to share a thought."}</p><button type="button" className={styles.greenButton} onClick={resetFilters}>Explore conversations<ArrowRight size={17} /></button></div></div>}
        </div>
        <div className={styles.moreDoodle} aria-hidden="true"><ArrowDown size={36} strokeWidth={1.1} /><span>More conversations<br />below</span></div>
      </div>
    </div>

    <CommunityFooterTear />

    <dialog ref={guidelines} className={styles.guidelinesDialog} aria-labelledby="community-guidelines-title" onClick={(event) => { if (event.target === event.currentTarget) guidelines.current?.close(); }}>
      <div className={styles.dialogContent}><button type="button" className={styles.closeDialog} aria-label="Close community guidelines" onClick={() => guidelines.current?.close()}><X size={23} /></button><ShieldCheck size={36} strokeWidth={1.4} /><p className={styles.dialogEyebrow}>A little kindness goes a long way</p><h2 id="community-guidelines-title">Our community guidelines</h2><p>A few shared promises help everyone feel welcome, respected, and heard.</p><ol>{COMMUNITY_GUIDELINES.map((rule) => <li key={rule.title}><h3>{rule.title}</h3><p>{rule.text}</p></li>)}</ol><button type="button" className={styles.greenButton} onClick={() => guidelines.current?.close()}>Back to the conversations<ArrowRight size={18} /></button></div>
    </dialog>
  </section>;
}

type ConversationCardProps = {
  post: CommunityPost; index: number;
  onLike: () => void; onDislike: () => void; onSave: () => void; onHide: () => void; onCopy: () => Promise<void>; onDelete?: () => void; onDeleteComment: (entryId: string) => void; onReactComment: (entryId: string, liked: boolean) => void; onReportComment: (entryId: string) => void;
  onComment: (body: string, parentId: string | null, guest?: GuestDetails) => void;
  signedIn: boolean;
};

function ConversationCard({ post, index, onLike, onDislike, onSave, onHide, onCopy, onComment, onDelete, onDeleteComment, onReactComment, onReportComment, signedIn }: ConversationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [comment, setComment] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; author: string } | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const menu = useRef<HTMLDetailsElement>(null);
  const replyInput = useRef<HTMLTextAreaElement>(null);
  const [hiddenComments, setHiddenComments] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    function closeMenu(event: PointerEvent) {
      if (!(event.target instanceof Node)) return;
      document.querySelectorAll<HTMLDetailsElement>(`.${styles.postMenu}, .${styles.commentMenu}`).forEach((item) => {
        if (!item.contains(event.target as Node)) item.removeAttribute("open");
      });
    }
    document.addEventListener("pointerdown", closeMenu);
    return () => document.removeEventListener("pointerdown", closeMenu);
  }, []);

  function submitComment(event: FormEvent) {
    event.preventDefault();
    if (!comment.trim()) return;
    if (!signedIn && (!guestName.trim() || !guestEmail.trim())) return;
    onComment(comment.trim(), replyTo?.id ?? null, signedIn ? undefined : { name: guestName.trim(), email: guestEmail.trim(), isAnonymous: anonymous });
    setComment(""); setReplyTo(null);
  }

  return <article id={`conversation-${post.id}`} className={styles.conversation} data-decoration={index % 4}>
    <PaperSurface seed={index + 110} />
    {index % 4 === 0 && <PaperPin className={styles.conversationPinLeft} />}
    {index % 4 === 1 && <><PaperTape className={styles.conversationTape} /><BotanicalSprig className={styles.conversationLeavesLeft} /></>}
    {index % 4 === 2 && <PaperPin className={styles.conversationPinRight} />}
    {index % 4 === 3 && <BotanicalSprig className={styles.conversationLeavesRight} />}
    <div className={styles.conversationContent}>
      <div className={styles.conversationMeta}><span className={styles.topicBadge} data-topic={post.topic}>{post.topic}</span><span className={styles.postAge}>{post.age}</span>
        <details ref={menu} className={styles.postMenu} onKeyDown={(event) => { if (event.key === "Escape") menu.current?.removeAttribute("open"); }}><summary aria-label={`Options for ${post.title}`}><MoreHorizontal size={22} /></summary><div><button type="button" onClick={() => { void onCopy(); menu.current?.removeAttribute("open"); }}><Link2 size={15} />Copy link</button>{onDelete ? <button type="button" onClick={() => { onDelete(); menu.current?.removeAttribute("open"); }}><X size={15} />Delete thread</button> : <button type="button" onClick={onHide}><X size={15} />Hide conversation</button>}</div></details>
      </div>
      <h3><button type="button" onClick={() => setExpanded(!expanded)} aria-expanded={expanded} aria-controls={`comments-${post.id}`}>{post.title}</button></h3>
      {post.body && <p className={styles.conversationBody}>{post.body}</p>}
      {post.attachment && <div className={styles.postAttachment}>{post.attachment.type === "video" ? <video src={post.attachment.url} controls preload="metadata" /> : <img src={post.attachment.url} alt={post.attachment.name} loading="lazy" />}</div>}
      <div className={styles.conversationActions}>
        <span className={styles.postAuthor}><DemoAvatar variant={post.avatar} /><span>{post.author}</span></span>
        <button type="button" onClick={() => setExpanded(!expanded)} aria-label={`${post.commentCount} comments on ${post.title}`} aria-expanded={expanded} aria-controls={`comments-${post.id}`}><MessageCircle size={22} strokeWidth={1.6} /><span>{post.commentCount}</span></button>
        <button type="button" onClick={onLike} aria-label={`Like ${post.title}`} aria-pressed={post.liked}><Heart size={22} strokeWidth={1.6} fill={post.liked ? "currentColor" : "none"} /><span>{post.likes}</span></button>
        <button type="button" onClick={onSave} aria-label={`${post.saved ? "Unsave" : "Save"} ${post.title}`} aria-pressed={post.saved}><Bookmark size={21} strokeWidth={1.6} fill={post.saved ? "currentColor" : "none"} /><span>{post.saved ? "Saved" : "Save"}</span></button>
      </div>

      {expanded && <div id={`comments-${post.id}`} className={styles.comments}>
        <div className={styles.commentsHeading}><h4>Join the conversation</h4><button type="button" onClick={onDislike} aria-pressed={post.disliked}><ThumbsDown size={16} />{post.disliked ? "Feedback noted" : "Not for me"}</button></div>
        {post.comments.filter((item) => !hiddenComments.has(item.id)).map((item) => <div key={item.id} className={`${styles.comment} ${item.parentId ? styles.nestedComment : ""}`}><span className={styles.commentAvatar}>{item.author.trim().charAt(0).toUpperCase()}</span><div><strong>{item.author}</strong><p>{item.body}</p><div className={styles.commentActions}><span>{item.age ?? "Just now"}</span><button type="button" aria-pressed={item.liked} onClick={() => onReactComment(item.id, Boolean(item.liked))}>Like{item.likes ? ` ${item.likes}` : ""}</button><button type="button" onClick={() => { setReplyTo({ id: item.id, author: item.author }); replyInput.current?.focus(); }}>Reply</button><details className={styles.commentMenu}><summary aria-label={`More options for ${item.author}'s comment`}><MoreHorizontal size={17} /></summary><div><button type="button" onClick={() => setHiddenComments((current) => new Set(current).add(item.id))}>Hide comment</button><button type="button" onClick={() => onReportComment(item.id)}>Report comment to admin</button>{item.canDelete && <button type="button" onClick={() => onDeleteComment(item.id)}>Delete comment</button>}</div></details></div></div></div>)}
        {!post.comments.length && <p className={styles.firstComment}>A little encouragement can start something good. Leave the first reply.</p>}
        <form onSubmit={submitComment} className={styles.commentForm}><label htmlFor={`reply-${post.id}`}>{replyTo ? `Reply to ${replyTo.author}` : "Your perspective matters"}</label>{replyTo && <button type="button" className={styles.cancelReply} onClick={() => setReplyTo(null)}>Cancel reply<X size={13} /></button>}{!signedIn && <><div className={styles.guestFields}><input value={guestName} onChange={(event) => setGuestName(event.target.value)} placeholder="Your name" maxLength={80} required /><input value={guestEmail} onChange={(event) => setGuestEmail(event.target.value)} placeholder="Email address" type="email" maxLength={254} required /></div><label className={styles.anonymousChoice}><input type="checkbox" checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} />Comment anonymously</label></>}<textarea ref={replyInput} id={`reply-${post.id}`} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Share a thought or a little encouragement..." rows={2} maxLength={3000} required /><button type="submit" className={styles.greenButton}>Post reply<Send size={15} /></button></form>
      </div>}
    </div>
  </article>;
}
