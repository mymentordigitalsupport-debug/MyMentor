# My Mentor emails

All app-managed messages use the cream and forest templates in `public/assets/emails/`. Edit `scripts/generate-email-templates.cjs`, then run `node scripts/generate-email-templates.cjs` and `node scripts/test-transactional-email-templates.cjs`.

| Trigger | Recipient | Template / sender |
| --- | --- | --- |
| Member registration or email confirmation | Member | `memberWelcome` / Resend queue |
| Member registration | Admin | `adminNotification` / Resend queue |
| Author application | Author, admin | `authorApplicationReceived`, `adminNotification` / Resend queue |
| Author application decision | Author | `authorApproved` or `authorDeclined` / Resend queue |
| Article submission | Author, admin | `articleReceived`, `adminNotification` / Resend queue |
| Article decision | Author | `articlePublished` or `articleDeclined` / Resend queue |
| Threads report | Admin | `adminNotification` / Resend queue |
| Guest comment verification | Guest | `threadVerification` / immediate Resend send; 10 minute code |
| EFT request created | Member, admin | `paymentRequestCreated`, `adminNotification` / Resend queue |
| EFT proof submitted | Member, admin | `paymentProofReceived`, `adminNotification` / Resend queue |
| EFT approved, rejected, or needs new proof | Member | `paymentApproved`, `paymentRejected`, `paymentNeedsResubmission` / Resend queue |
| EFT cancelled | Member | `paymentCancelled` / Resend queue |
| Account confirmation | Member or author | `supabase/email-templates/confirm-signup.html` / hosted Supabase Auth |
| Password reset | Member or author | `supabase/email-templates/reset-password.html` / hosted Supabase Auth |

EFT emails include the exact payment reference, amount, and a link to the current bank instructions. They never claim course access before approval. The admin gets separate notices when a request is created and when proof is submitted. Email event keys include the payment transition time, so a later resubmission can generate a new notification.

Copy follows the actual state: a request is not a completed payment, submitted proof is not approval, and approval activates the purchased access. Rejection and resubmission require an admin reason; the reason appears in the member email. If money has already left a member's bank account after cancellation or rejection, the message directs them to `hello@mymentor.digital` with the reference. Author application messages do not link to the author dashboard while access is pending or declined. A declined article links to its editable page.

## Hosted Supabase Auth setup

The two Auth templates are ready to paste, but the repository cannot change hosted Auth settings with a service role key. In the Supabase project Dashboard, open **Authentication → Email Templates** and set:

| Template | Subject | HTML file |
| --- | --- | --- |
| Confirm sign up | `Confirm your My Mentor email` | `supabase/email-templates/confirm-signup.html` |
| Reset password | `Reset your My Mentor password` | `supabase/email-templates/reset-password.html` |

Set the Supabase Auth **Site URL** to the app origin (for example, `https://mymentor.digital`). Both templates use that origin and a token hash to reach the app's `/auth/confirm` handler. The handler completes sign-up or password recovery. Test both links using development accounts after the templates are applied. Hosted Supabase may require custom SMTP to edit email templates on a Free project.

Other Supabase Auth templates (invite, magic link, email change, reauthentication) have no call site in this app. Supabase security notifications depend on project settings; audit those settings separately if enabled.

`node scripts/preview-email-templates.cjs` produces local sample HTML in `artifacts/email-previews/`. It uses fake names and references and sends no email.
