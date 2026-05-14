Design an educational DES encryption visualization page for high school students 
inside a web app called "CryptoDES". The page teaches DES step-by-step with 
simple language, analogies, and visual bit representations.

=== DESIGN SYSTEM ===
Font: Inter (all weights)
Canvas: 1440px wide desktop frame
Content max-width: 860px, centered
Page background: #F8FAFC
Primary blue: #2563EB
Border: #E2E8F0 at 0.5px
Border radius components: 8px | Cards: 12px | Pills: 20px
Spacing: 4 / 8 / 12 / 16 / 24px grid

=== GLOBAL NAVBAR ===
Height: 56px | bg: #FFFFFF | border-bottom: 0.5px #E2E8F0
Left: Logo icon (28x28 rounded 7px bg #2563EB, white lock icon 16px) 
      + text "CryptoDES" Inter 14px weight 500 #0F172A
Right: 3 nav pills (Inter 13px, padding 6px 14px, radius 6px)
       "Beranda" | "Enkripsi" | "Visualisasi" ← active state: 
       bg #F1F5F9, weight 500, color #0F172A

=== PAGE LAYOUT ===
Top padding: 32px
Bottom padding: 48px
Left/right padding: 290px (centers 860px content on 1440px canvas)

--- SECTION 1: PROGRESS BAR AREA ---
Width: 100% of content area (860px)
Height: auto
Margin-bottom: 14px

Progress steps row:
  - 6 equal-width rectangles in a flex row, gap 4px
  - Each bar: height 4px, border-radius 2px
  - Done state: fill #2563EB
  - Active state: fill #93C5FD
  - Pending state: fill #E2E8F0
  - Total 6 bars representing 6 DES steps

Progress label below bars:
  - Inter 11px #64748B
  - Text: "Langkah 1 dari 6 — Mengubah teks menjadi angka (biner)"

--- SECTION 2: STEP HEADER CARD ---
bg: #FFFFFF
border: 0.5px #E2E8F0
border-radius: 12px
padding: 18px 20px
margin-bottom: 12px
width: 100%

Inside top: Step tag pill
  - padding: 3px 10px, border-radius: 20px
  - STEP 1 color: bg #EFF6FF, border #BFDBFE, text #1D4ED8
  - STEP 2 color: bg #F0FDF4, border #86EFAC, text #15803D
  - STEP 3 color: bg #F3E8FF, border #C4B5FD, text #7C3AED
  - STEP 4 color: bg #FFF7ED, border #FED7AA, text #C2410C
  - STEP 5 color: bg #F0FDF4, border #86EFAC, text #15803D
  - STEP 6 color: bg #EFF6FF, border #BFDBFE, text #1D4ED8
  - Content: step number icon (Tabler circle-number-N) 12px + label "Langkah N"

Step title below pill:
  - Inter 16px weight 500 #0F172A
  - margin-top: 10px, margin-bottom: 6px

Step subtitle below title:
  - Inter 13px weight 400 #64748B
  - line-height: 1.6
  - Max 2 lines of explanation in plain Indonesian, no jargon

--- SECTION 3: ANALOGY BOX ---
bg: #FFFBEB
border: 0.5px #FDE68A
border-radius: 10px
padding: 12px 14px
margin-bottom: 12px
Display: flex row, gap 10px, align-items flex-start

Left: Tabler icon "ti-bulb" 20px color #F59E0B
Right: text block
  - "Analogi:" in Inter 12px weight 500 color #78350F
  - Description text in Inter 12px weight 400 color #92400E, line-height 1.65
  - Keep max 3 sentences, use everyday comparisons a student can relate to

ANALOGY CONTENT PER STEP:
Step 1: "Bayangkan kamu ingin mengirim surat rahasia, tapi kurir 
         hanya bisa membawa kartu angka 0 dan 1. Maka setiap 
         huruf harus kamu ubah dulu ke kode angka sebelum dikirim."

Step 2: "Bayangkan 64 orang berdiri berjajar dengan nomor urut. 
         Tiba-tiba ada instruksi: orang nomor 58 pindah ke posisi 1, 
         orang nomor 50 pindah ke posisi 2. Semua berpindah 
         sesuai aturan tabel — tidak ada yang hilang, hanya 
         berpindah tempat."

Step 3: "Bayangkan kamu punya 1 password utama, lalu aplikasi 
         membuatkan 16 password turunan yang berbeda. Ronde 1 
         pakai turunan #1, ronde 2 pakai #2, dan seterusnya."

Step 4: "Bayangkan kamu dan temanmu saling bertukar isi tas 
         sebanyak 16 kali, tapi setiap pertukaran isi tasmu 
         diacak dulu pakai kode rahasia yang berbeda tiap 
         putaran. Setelah 16 kali tukar, isi tas sangat berbeda 
         dari aslinya."

Step 5: "Bayangkan mengubah satu huruf saja di pesan asli 
         bisa mengubah lebih dari setengah isi ciphertext — 
         seperti efek bola salju dari perubahan yang sangat 
         kecil."

Step 6: "Setelah semua proses selesai, hasilnya dikemas ulang 
         dalam urutan khusus dan diserahkan sebagai ciphertext. 
         Hanya yang tahu kunci dan urutan yang sama bisa 
         membukanya."

--- SECTION 4: MAIN VISUAL CARD ---
bg: #FFFFFF
border: 0.5px #E2E8F0
border-radius: 12px
overflow: hidden
margin-bottom: 12px

Card internal header bar:
  height: 40px
  padding: 0 16px
  border-bottom: 0.5px #E2E8F0
  bg: #FFFFFF
  Content: Tabler icon (16px #64748B) + label text (12px weight 500 #64748B)

=== VISUAL CARD CONTENT — PER STEP ===

--- STEP 1 VISUAL: Character conversion table ---
Content area padding: 16px

Row 1 — Character boxes (flex row, gap 6px, flex-wrap):
  8 boxes for H E L L O 1 2 3
  Each box (text-align center):
    Top cell: 36×36px rounded 7px bg #EFF6FF border #BFDBFE
              Inter 15px weight 500 color #1D4ED8 — the letter
    Mid label: Inter 10px #64748B font-mono — ASCII decimal (e.g. 72)
    Bot label: Inter 10px #64748B font-mono — binary (e.g. 01001000)
  Between boxes: "·" separator dot #94A3B8

Row 2 — Combined 64-bit display:
  Label: "64-bit gabungan (8 karakter × 8 bit):" — 11px weight 500 #64748B
  Bit grid: 64 cells in flex-wrap row, gap 3px
  Each cell: 20×20px rounded 3px Inter 10px font-mono weight 500
    bit-0: bg #F1F5F9 border #CBD5E1 text #64748B
    bit-1: bg #DBEAFE border #93C5FD text #1D4ED8
  Group visually by 8 bits (add 6px margin-right after every 8th bit)

Legend row (padding 10px 16px, border-top 0.5px #E2E8F0):
  flex row gap 12px
  Each legend item: 14×14px color dot (rounded 3px) + 11px #64748B label
  Items: "Bit 1" (blue dot) | "Bit 0" (gray dot)

--- STEP 2 VISUAL: Permutation before/after ---
Content area padding: 14px 16px

Label: "Sebelum permutasi (plaintext asli):" — 11px weight 500 #64748B
Bit grid 1: 64 bits, blue/gray cells (same spec as step 1)

Separator: centered text "↓ tabel IP mengatur ulang urutan bit ↓"
           Inter 12px #64748B, padding 8px 0

Label: "Setelah permutasi (urutan berubah, isi tetap sama):" — 11px #64748B
Bit grid 2: 64 bits, same spec PLUS:
  Highlighted changed cells: bg #FEF3C7 border #FCD34D text #92400E
  Approx 16 highlighted cells spread across the grid

Legend (border-top): "Bit 1" | "Bit 0" | "Bit yang berpindah posisi" (yellow dot)

--- STEP 3 VISUAL: Key schedule ---
Content area padding: 16px

Key character table:
  flex row, border 0.5px #E2E8F0, border-radius 8px, overflow hidden
  8 columns (M Y K E Y 1 2 3), each column:
    border-right: 0.5px #E2E8F0 (last has none)
    padding: 10px 4px, text-align center
    Top: Inter 15px weight 500 #7C3AED — the character
    Bottom: Inter 9px font-mono #64748B — first 4 bits (e.g. "0100")

Subkey K1 display:
  Label: "Subkey K1 yang dipakai di ronde pertama (48-bit):" — 11px #64748B
  Bit grid: 48 cells
    bit-1: bg #F3E8FF border #C4B5FD text #7C3AED (purple theme)
    bit-0: bg #F8FAFC border #E2E8F0 text #94A3B8

Info box below:
  bg #F8FAFC, border-radius 8px, padding 10px 12px
  Inter 12px #64748B line-height 1.6
  Text: "Total: 16 subkey dibuat (K1–K16), masing-masing 48-bit. 
         Setiap subkey dipakai sekali per ronde."
  Bold parts (#0F172A weight 500): "16 subkey" and "48-bit"

Round indicator row (border-top 0.5px #E2E8F0, padding 14px 16px):
  16 pill buttons K1–K16, flex-wrap, gap 4px
  Each: 28×28px rounded 6px Inter 10px weight 500
  Active (K1): bg #2563EB text #FFFFFF border #2563EB
  Done: bg #DCFCE7 text #15803D border #86EFAC
  Todo: bg #F8FAFC text #94A3B8 border #E2E8F0

--- STEP 4 VISUAL: Feistel round diagram ---
Content area padding: 16px, flex column gap 10px

Row 1 (flex, gap 8px, align-items center):
  Block L: flex-1, padding 10px 12px, rounded 8px
            bg #EFF6FF border #BFDBFE text #1D4ED8
            Title "L (32-bit kiri)" Inter 12px weight 500
            Subtitle "11001100 01010101..." Inter 10px weight 400
  Arrow: "⟶" 16px #94A3B8 flex-none
  Block result: flex-1, same size
            bg #FFF7ED border #FED7AA text #C2410C
            Title "Menjadi R baru" 12px weight 500
            Subtitle "(L lama tidak diubah dulu)" 10px

XOR row (flex, gap 8px, align-items center, padding 0 4px):
  XOR circle: 36×36px rounded 50% bg #FFFBEB border #FDE68A
              text "⊕" Inter 14px weight 600 #92400E flex-none
  Description: Inter 11px #64748B flex-1 line-height 1.5
    "XOR: menggabungkan bit L dengan hasil fungsi F"
    Below: "0⊕0=0   1⊕1=0   0⊕1=1   1⊕0=1" — 10px font-mono

Row 2 (same layout as Row 1):
  Block R: bg #F0FDF4 border #86EFAC text #15803D
            "R (32-bit kanan)" + "10110010 11001100..."
  Arrow: "⟶"
  Block F: bg #F3E8FF border #C4B5FD text #7C3AED
            "Fungsi F + Subkey Kn"
            "R diperluas → XOR Kn → S-box → permutasi" (10px)

Info box:
  bg #F8FAFC rounded 8px padding 10px 12px margin-top 4px
  Inter 12px #64748B line-height 1.6
  "Hasil setelah satu ronde: R lama → L baru, 
   (L lama ⊕ F(R,Kn)) → R baru. Proses ini diulang 
   16 kali dengan subkey yang berbeda."

Round tracker (border-top, padding 14px 16px):
  16 dots R1–R16, gap 4px, flex-wrap
  R1–R8: done state (green)
  R9: active state (blue filled)
  R10–R16: todo state (gray)

--- STEP 5 VISUAL: Avalanche Effect ---
Content area: 2-column grid, gap 10px, padding 14px 16px

Each column:
  Label: Inter 11px weight 500 #64748B
  Column A label: 'Plaintext: "HELLO123" → Ciphertext A'
  Column B label: 'Plaintext: "HELLO223" → Ciphertext B'
  
  Bit grid: 64 small cells (16×16px), gap 2px, flex-wrap
  Same bit (green): bg #DCFCE7 border #86EFAC text #15803D
  Different bit (red): bg #FEE2E2 border #FCA5A5 text #DC2626
  Approx 34 red cells spread across both grids
  
  Below grid: "Hex: A3F48C2DB1E79A40" — Inter 12px #64748B weight 400
              bold hex value: #0F172A weight 500

Result highlight box (full width below grid, padding 0 14px 14px):
  bg #F0FDF4 border #86EFAC border-radius 8px padding 12px
  Inter 12px #15803D line-height 1.65
  "Hanya 1 karakter berbeda ("1" → "2"), tapi 34 dari 64 bit (53%) 
   ciphertext berubah. Ini disebut Avalanche Effect — tanda 
   enkripsi bekerja dengan baik."
  Bold: "34 dari 64 bit (53%)" and "Avalanche Effect"

Legend (border-top): 
  "Bit sama" (green dot) | "Bit berbeda" (red dot)

--- STEP 6 VISUAL: Final output ---
Content area: padding 16px, text-align center

Label: "Ciphertext (format Hexadecimal):" — 12px #64748B, margin-bottom 8px

Result box (centered):
  bg #EFF6FF border #BFDBFE border-radius 10px padding 14px 20px
  font-mono 20px weight 500 #1D4ED8 letter-spacing 0.08em
  Content: "A3F4 8C2D B1E7 9A40"

Note text below result box:
  Inter 12px #64748B line-height 1.6 text-align center
  "64-bit hasil enkripsi direpresentasikan sebagai 16 karakter 
   heksadesimal. Hanya bisa dikembalikan ke HELLO123 menggunakan 
   key MYKEY123 yang sama."

Bit output grid:
  Label: "Bit ciphertext final (64-bit):" — 11px weight 500 #64748B
  64 bit cells: bg #DCFCE7 border #86EFAC text #15803D (all green = success)

Stats row (3 columns, gap 8px, margin 0 16px 16px):
  Each stat box: rounded 8px padding 10px text-align center
  Box 1 — bg #F0FDF4 border #86EFAC: label "Total ronde" 11px #15803D 
           value "16" 18px weight 500 #15803D
  Box 2 — bg #EFF6FF border #BFDBFE: label "Ukuran blok" 11px #1D4ED8 
           value "64 bit" 18px weight 500 #1D4ED8
  Box 3 — bg #F3E8FF border #C4B5FD: label "Panjang key" 11px #7C3AED 
           value "56 bit" 18px weight 500 #7C3AED

--- SECTION 5: NAVIGATION ROW ---
margin-top: 4px
display: flex, justify-content: space-between, align-items: center

Left button "← Sebelumnya":
  bg transparent, border 0.5px #E2E8F0, border-radius 8px
  padding 8px 16px, Inter 13px #0F172A
  Left icon: ti-arrow-left 13px
  Disabled state (step 1): opacity 0.35

Right side: flex row gap 8px
  Ghost button "Ubah input":
    same style as prev button
    Left icon: ti-edit 13px
  
  Primary button "Selanjutnya →" (steps 1-5):
    bg #2563EB, color #FFFFFF, border-radius 8px
    padding 8px 16px, Inter 13px weight 500
    Right icon: ti-arrow-right 13px
  
  Final button "✓ Selesai" (step 6 only):
    bg #16A34A, color #FFFFFF, border-radius 8px
    padding 8px 16px, Inter 13px weight 500
    Left icon: ti-check 13px

=== COMPONENTS TO CREATE ===
Create as Figma components with variants:

1. BitCell
   Variants: State = [zero, one, highlighted, changed, output]
   Size: 20×20px (large) or 16×16px (small for avalanche)

2. StepTagPill
   Variants: Step = [1, 2, 3, 4, 5, 6]
   Each has unique bg/border/text color

3. AnalogyBox
   Fixed layout, icon always ti-bulb
   Text content as override

4. ProgressBar
   Variant: ActiveStep = [1, 2, 3, 4, 5, 6]
   6 bar segments auto-color by active step

5. RoundDot
   Variants: State = [done, active, todo]
   Size: 28×28px, label "K1"–"K16" or "R1"–"R16"

6. NavButton
   Variants: Type = [prev, next, finish, ghost]
   Each has correct colors and icons

7. FeistelBlock
   Variants: Type = [L-block, R-block, key-block, result-block]
   Each has unique color scheme

=== PROTOTYPE CONNECTIONS ===
Frame 1 (Step 1) → Frame 2 (Step 2):
  Trigger: "Selanjutnya" button click
  Animation: Smart Animate, ease-out, 300ms, slide left

Frame N → Frame N-1:
  Trigger: "Sebelumnya" button click
  Animation: Smart Animate, ease-out, 300ms, slide right

Each frame: same layout, only SECTION 2 + 3 + 4 content changes
Progress bar updates per frame

"Ubah input" button → Enkripsi page
"Beranda" nav tab → Landing page

=== DESIGN TOKENS (CREATE AS FIGMA STYLES) ===

Color styles:
  Primary/Blue-600: #2563EB
  Primary/Blue-100: #DBEAFE
  Primary/Blue-50: #EFF6FF
  Surface/White: #FFFFFF
  Surface/Gray: #F8FAFC
  Border/Default: #E2E8F0
  Text/Primary: #0F172A
  Text/Secondary: #64748B
  Text/Hint: #94A3B8
  Accent/Green-50: #F0FDF4
  Accent/Green-200: #DCFCE7
  Accent/Purple-50: #F3E8FF
  Accent/Amber-50: #FFFBEB
  Accent/Red-100: #FEE2E2

Text styles:
  Heading/H1: Inter 16px weight 500 #0F172A
  Body/Regular: Inter 13px weight 400 #64748B line-height 1.6
  Label/Small: Inter 11px weight 500 #64748B
  Mono/Bit: Inter 10px weight 500 font-mono
  Mono/Hex: Inter 12px weight 400 font-mono
  Badge/Tag: Inter 11px weight 500 (color varies)

=== NOTES FOR FIGMA ===
- Use Auto Layout on ALL components (vertical and horizontal)
- Bit cell grids: use Figma "Grid" fill with wrap enabled
- All 6 step frames share identical outer structure — 
  only swap the 3 inner sections (header card, analogy box, visual card)
- Export frames at 1x and 2x for developer handoff
- Add Figma Dev Mode annotations on spacing and color tokens
- Use "Publish styles" so the design system is shareable