"use client";

import ContributorsWall, { type Contributor } from "@/components/ui/contributors-section";

const handles = [
  "HenriqueBragaMoreira", "alex_codes", "mariadev", "tom.builds", "jin_woo", "sofia.ux", "devkarl", "nadia_r", "liam.ts", "ravi-shankar",
  "emma_oss", "noah.dev", "yuki_t", "isabella", "mohammed_a", "grace.hopper", "leo_martin", "priya.k", "sven-ar", "chloe.web",
  "daniel_kim", "olga_v", "hassan.dev", "mila_w", "arthur.js", "fatima_z", "bruno.css", "aiko_n", "victor-h", "lena.code",
  "omar_b", "tara.gg", "felix_m", "nora_s", "kenji.io", "paula_r", "sami_dev", "ingrid", "pablo.ts", "wei_chen",
];

const contributors: Contributor[] = Array.from({ length: 180 }, (_, i) => {
  const username = `${handles[i % handles.length]}${i >= handles.length ? `_${Math.floor(i / handles.length)}` : ""}`;
  return {
    username,
    avatarUrl: `https://i.pravatar.cc/120?u=${encodeURIComponent(username)}`,
    profileUrl: `https://github.com/${username}`,
  };
});

const settings = {
  totalCount: 871,
  columns: 16,
  height: 300,
};

export function MyMentorInvitationWall(props: Partial<typeof settings>) {
  const s = { ...settings, ...props };
  return (
    <div className="w-full">
      <ContributorsWall
        title="Contributors"
        contributors={contributors}
        totalCount={s.totalCount}
        columns={s.columns}
        height={s.height}
      />
    </div>
  );
}
