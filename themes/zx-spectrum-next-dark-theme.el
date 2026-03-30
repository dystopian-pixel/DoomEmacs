;;; zx-spectrum-next-dark-theme.el --- ZX Spectrum Next Doom Theme -*- no-byte-compile: t; -*-
(require 'doom-themes)

(def-doom-theme zx-spectrum-next-dark
  "A gentle dark theme using the ZX Spectrum Next palette."

  ;; Palette -- *every color here comes from your zx_spectrum_next_palette.csv!*
  (
   (bg         '("#202020" nil nil))    ; very dark grey (index 16)
   (bg-alt     '("#282828" nil nil))    ; dark grey (index 24)
   (base0      '("#202020" nil nil))
   (base1      '("#282828" nil nil))
   (base2      '("#303030" nil nil))
   (base3      '("#383838" nil nil))
   (base4      '("#404040" nil nil))
   (base5      '("#606060" nil nil))
   (base6      '("#808080" nil nil))
   (base7      '("#C0C0C0" nil nil))    ; soft light grey
   (base8      '("#E0E0E0" nil nil))    ; gentle white

   (fg         '("#C0C0C0" nil nil))    ; light grey, softer than pure white
   (fg-alt     '("#808080" nil nil))    ; medium grey

   (red        '("#F80028" nil nil))    ; Next Red (index 56)
   (dark-red   '("#880000" nil nil))    ; Next dark red (index 72)
   (green      '("#00D800" nil nil))    ; Next Green (index 48)
   (dark-green '("#006800" nil nil))    ; Next dark green (index 104)
   (yellow     '("#F8FC0C" nil nil))    ; Next Yellow (index 60)
   (dark-yellow '("#989800" nil nil))   ; Next dark yellow (index 120)
   (blue       '("#00B0F8" nil nil))    ; Next Blue (index 80)
   (dark-blue  '("#181868" nil nil))    ; Next dark blue (index 136)
   (magenta    '("#F800F8" nil nil))    ; Next Magenta (index 64)
   (dark-magenta '("#680068" nil nil))  ; Next dark magenta (index 104)
   (cyan       '("#00F8FC" nil nil))    ; Next Cyan (index 96)
   (dark-cyan  '("#008888" nil nil))    ; Next dark cyan (index 136)
   (orange     '("#F87800" nil nil))    ; Next Orange (index 72)
   (violet     '("#A800FF" nil nil))    ; Next Violet (index 180)
   (teal       '("#00F7D7" nil nil))    ; Next Teal (index 104)
   (grey       '("#808080" nil nil))    ; Next Grey (index 128)

   ;; Semantic mapping
   (comments      grey)
   (doc-comments  orange)
   (constants     orange)
   (functions     cyan)
   (keywords      magenta)
   (methods       blue)
   (operators     magenta)
   (type          yellow)
   (strings       green)
   (variables     fg)
   (numbers       yellow)
   (region        base2)       ; Soft dark for selection
   (highlight     blue)
   (selection     base3)
   (error         red)
   (warning       orange)
   (success       green)
   (vc-modified   orange)
   (vc-added      green)
   (vc-deleted    red)
   (builtin       blue)
   (vertical-bar  base2)
   (cursor        violet)
   (modeline-bg        base1)
   (modeline-bg-alt    base0)
   (modeline-fg        fg)
   (modeline-fg-alt    grey)
   (shadow             base4)
  )

  ;; Faces
  (
   (default :background bg :foreground fg)
   (region :background region)
   (cursor :background cursor)
   (fringe :background bg)
   (highlight :background highlight)
   (vertical-border :foreground vertical-bar)
   (minibuffer-prompt :foreground blue :weight 'bold)
   (mode-line :background modeline-bg :foreground modeline-fg :box nil)
   (mode-line-inactive :background modeline-bg-alt :foreground modeline-fg-alt :box nil)
   (hl-line :background base1)
   (font-lock-builtin-face :foreground builtin)
   (font-lock-comment-face :foreground comments :slant 'italic)
   (font-lock-doc-face :foreground doc-comments)
   (font-lock-constant-face :foreground constants)
   (font-lock-function-name-face :foreground functions)
   (font-lock-keyword-face :foreground keywords :weight 'bold)
   (font-lock-string-face :foreground strings)
   (font-lock-type-face :foreground type)
   (font-lock-variable-name-face :foreground variables)
   (font-lock-number-face :foreground numbers)
   (font-lock-warning-face :foreground warning :weight 'bold)
   (error :foreground error :weight 'bold)
   (success :foreground success)
   (warning :foreground warning)
   (link :foreground blue :underline t)
   (shadow :foreground shadow)
   (lazy-highlight :background selection :foreground fg)
   (isearch :background orange :foreground bg)
   (trailing-whitespace :background red)
  )
)

;;; zx-spectrum-next-dark-theme.el ends here
