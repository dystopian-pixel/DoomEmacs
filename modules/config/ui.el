;;; ui.el --- UI settings -*- lexical-binding: t; -*-

(defvar my/last-theme-file
  (expand-file-name "modules/config/.last-theme.el" doom-user-dir)
  "File used to persist the last selected theme.")

(defun my/write-last-theme-file (theme)
  "Write THEME to `my/last-theme-file'."
  (with-temp-file my/last-theme-file
    (insert (format "(setq doom-theme '%S)\n" theme))))

(defun my/persist-theme-a (theme &rest _)
  "Persist THEME whenever it is enabled or loaded."
  (when (and (symbolp theme) (custom-theme-p theme))
    (setq doom-theme theme)
    (my/write-last-theme-file theme)))

;; Restore the saved theme before Doom applies it at startup.
(if (file-exists-p my/last-theme-file)
    (load my/last-theme-file nil t)
  (setq doom-theme 'doom-one))

;; Capture theme changes from consult-theme, load-theme, dashboard cycling,
;; browser gallery switching, and anything else that enables a theme.
(unless (advice-member-p #'my/persist-theme-a #'load-theme)
  (advice-add 'load-theme :after #'my/persist-theme-a))
(unless (advice-member-p #'my/persist-theme-a #'enable-theme)
  (advice-add 'enable-theme :after #'my/persist-theme-a))

(use-package! doom-themes
  :config
  (setq doom-themes-enable-bold t
        doom-themes-enable-italic t))

(add-to-list 'custom-theme-load-path (expand-file-name "themes" doom-user-dir))

(setq doom-font (font-spec :family "JetBrains Mono" :size 12)
      doom-variable-pitch-font (font-spec :family "Inter" :size 16)
      doom-big-font (font-spec :family "JetBrains Mono" :size 20)
      display-line-numbers-type t)

(custom-set-faces!
  '(font-lock-comment-face :slant italic)
  '(font-lock-comment-delimiter-face :slant italic))

(after! org
  (setq org-fontify-whole-heading-line t
        org-ellipsis " … "
        org-hide-emphasis-markers t
        org-pretty-entities t)

(custom-set-faces!
 '(org-level-8 :inherit outline-3 :height 1.0)
 '(org-level-7 :inherit outline-3 :height 1.0)
 '(org-level-6 :inherit outline-3 :height 1.1)
 '(org-level-5 :inherit outline-3 :height 1.2)
 '(org-level-4 :inherit outline-3 :height 1.3)
 '(org-level-3 :inherit outline-3 :height 1.4)
 '(org-level-2 :inherit outline-2 :height 1.5)
 '(org-level-1 :inherit outline-1 :height 1.6)
 '(org-document-title :height 1.8 :bold t :underline nil))

  (custom-set-faces!
   `(outline-1 :foreground ,(doom-color 'red))
   `(outline-2 :foreground ,(doom-color 'orange))
   `(outline-3 :foreground ,(doom-color 'yellow))
   `(outline-4 :foreground ,(doom-color 'green))
   `(outline-5 :foreground ,(doom-color 'blue))
   `(outline-6 :foreground ,(doom-color 'magenta))))

(use-package! org-modern
  :hook (org-mode . org-modern-mode)
  :config
  (setq org-modern-star 'replace
        org-modern-hide-stars ""
        org-modern-todo nil
        org-modern-block-name t
        org-modern-table nil
        org-modern-list '((?+ . "•") (?- . "–") (?* . "●"))))

;; Theme-aware, slightly brighter line numbers.
;; Applies after themes load so it isn't clobbered.
(after! doom-themes
  (custom-set-faces!
   ;; Non-current lines: a bit brighter than the usual gutter
   `(line-number
     :inherit default
     :height 0.95
     :foreground ,(or
                   (and (fboundp 'doom-color) (doom-color 'base7))
                   (and (fboundp 'doom-color) (doom-lighten (doom-color 'base6) 0.18))
                   "#a9aeb8"))
   ;; Current line: bright and bold for focus
   `(line-number-current-line
     :inherit default
     :height 1.0
     :weight bold
     :foreground ,(or
                   (and (fboundp 'doom-color) (doom-lighten (doom-color 'fg) 0.08))
                   "#ffffff"))))

(after! doom-themes
  (custom-set-faces!
   ;; Gentle tint using theme palette; stays subtle over transparent BGs
   `(hl-line
     :background ,(or (and (fboundp 'doom-blend) (fboundp 'doom-color)
                           (doom-blend (doom-color 'blue) (doom-color 'bg) 0.07))
                      (and (fboundp 'doom-color)
                           (doom-lighten (doom-color 'bg) 0.06))
                      "#2b2f36"))))

;; Soft, theme-aware fill-column indicator & VC gutter colors
(after! doom-themes
  (let* ((fci (or
               (and (fboundp 'doom-blend) (fboundp 'doom-color)
                    ;; faint line: 25% fg blended over bg
                    (doom-blend (doom-color 'fg) (doom-color 'bg) 0.25))
               (and (fboundp 'doom-color) (doom-lighten (doom-color 'base6) 0.25))
               "#6e7380"))
         (chg (or (and (fboundp 'doom-color) (doom-lighten (doom-color 'cyan)  0.08)) "#7fb4ca"))
         (ins (or (and (fboundp 'doom-color) (doom-lighten (doom-color 'green) 0.08)) "#86c991"))
         (del (or (and (fboundp 'doom-color) (doom-lighten (doom-color 'red)   0.05)) "#d18f96")))
    (custom-set-faces!
     ;; Fill-column indicator: quiet, readable, transparency-friendly
     `(fill-column-indicator
       :inherit shadow
       :foreground ,fci)

     ;; diff-hl (VC gutter): soft tints; keep backgrounds transparent
     `(diff-hl-change :background unspecified :foreground ,chg)
     `(diff-hl-insert :background unspecified :foreground ,ins)
     `(diff-hl-delete :background unspecified :foreground ,del)

     ;; If you use diff-hl in the margin instead of fringe, style those too:
     `(diff-hl-margin-change :background unspecified :foreground ,chg)
     `(diff-hl-margin-insert :background unspecified :foreground ,ins)
     `(diff-hl-margin-delete :background unspecified :foreground ,del))))

;; Theme-aware selection (region) styling
(after! doom-themes
  (let* ((bg   (and (fboundp 'doom-color) (doom-color 'bg)))
         ;; Prefer the theme's own selection tint; fall back to blue/magenta.
         (acc  (or (and (fboundp 'doom-color) (ignore-errors (doom-color 'selection)))
                   (and (fboundp 'doom-color) (ignore-errors (doom-color 'blue)))
                   (and (fboundp 'doom-color) (ignore-errors (doom-color 'magenta)))))
         ;; Blend accent into the background for a soft highlight.
         ;; Increase the 0.40 → 0.48 if you want a stronger selection.
         (sel-bg (or (and (fboundp 'doom-blend) acc bg (doom-blend acc bg 0.40))
                     (and (fboundp 'doom-lighten) acc (doom-lighten acc 0.25))
                     "#3a5fcd"))      ; conservative fallback
         ;; Keep foreground generally theme-driven; provide a bright fallback.
         (sel-fg (or (and (fboundp 'doom-color) (ignore-errors (doom-color 'fg)))
                     "#ffffff")))
    (custom-set-faces!
     ;; Primary selection
     `(region :background ,sel-bg :foreground ,sel-fg :extend t)
     ;; Secondary selection (used by some modes/commands)
     `(secondary-selection
       :background ,(or (and (fboundp 'doom-blend) sel-bg bg (doom-blend sel-bg bg 0.20))
                        "#4a6fdc")
       :foreground ,sel-fg :extend t))))

(after! doom-themes
  (custom-set-faces!
   `(mode-line
     :box nil :underline nil
     :background unspecified
     :overline ,(or (and (fboundp 'doom-blend) (fboundp 'doom-color)
                         (doom-blend (doom-color 'fg) (doom-color 'bg) 0.10))
                    "#3a3f46")
     :foreground ,(and (fboundp 'doom-color) (doom-color 'base6)))
   `(mode-line-inactive
     :box nil :underline nil
     :background unspecified
     :overline ,(or (and (fboundp 'doom-blend) (fboundp 'doom-color)
                         (doom-blend (doom-color 'fg) (doom-color 'bg) 0.06))
                    "#2f3339")
     :foreground ,(and (fboundp 'doom-color) (doom-color 'base5)))))

(after! doom-themes
  (custom-set-faces!
   `(minibuffer-prompt :foreground ,(and (fboundp 'doom-color) (doom-color 'blue)) :weight bold)
   ;; Orderless highlights: use distinct, theme-driven accents
   `(orderless-match-face-0 :foreground ,(and (fboundp 'doom-color) (doom-color 'yellow)) :weight semi-bold)
   `(orderless-match-face-1 :foreground ,(and (fboundp 'doom-color) (doom-color 'magenta)) :weight semi-bold)
   `(orderless-match-face-2 :foreground ,(and (fboundp 'doom-color) (doom-color 'cyan)) :weight semi-bold)
   `(orderless-match-face-3 :foreground ,(and (fboundp 'doom-color) (doom-color 'green)) :weight semi-bold)))

(when (modulep! :ui tabs)
  (after! centaur-tabs
    (setq centaur-tabs-style "bar"
          centaur-tabs-height 28
          centaur-tabs-set-icons t
          centaur-tabs-set-bar 'over
          centaur-tabs-show-navigation-buttons t
          centaur-tabs-set-modified-marker t
          centaur-tabs-adjust-buffer-order t
          centaur-tabs-cycle-scope 'tabs)

    (defun my/centaur-tabs-buffer-groups ()
      "Return the current buffer group for Centaur Tabs."
      (list
       (cond
        ((bound-and-true-p my/centaur-tabs-group)
         my/centaur-tabs-group)
        ((derived-mode-p 'org-mode)
         "Org")
        ((derived-mode-p 'emacs-lisp-mode 'lisp-interaction-mode)
         "Elisp")
        ((derived-mode-p 'dired-mode)
         "Dired")
        ((derived-mode-p 'help-mode 'helpful-mode 'special-mode)
         "System")
        ((derived-mode-p 'term-mode 'eshell-mode 'vterm-mode 'shell-mode)
         "Terminal")
        ((and (fboundp 'projectile-project-p)
              (projectile-project-p))
         (format "Project:%s" (projectile-project-name)))
        (t
         "Common"))))

    (setq centaur-tabs-buffer-groups-function #'my/centaur-tabs-buffer-groups)

    (add-hook 'doom-load-theme-hook #'centaur-tabs-mode)))

(with-eval-after-load 'centaur-tabs
  (custom-set-faces!
   '(centaur-tabs-default :inherit 'mode-line)
   '(centaur-tabs-selected :weight semibold)
   '(centaur-tabs-selected-modified :weight semibold)
   '(centaur-tabs-unselected :inherit 'mode-line-inactive)
   '(centaur-tabs-unselected-modified :inherit 'mode-line-inactive)))

(setf (alist-get 'alpha-background default-frame-alist) 80)
(setf (alist-get 'alpha-background initial-frame-alist) 80) ;; avoid first-frame flash

(with-eval-after-load 'ediff
  (set-face-attribute 'ediff-current-diff-A nil :inherit 'diff-removed)
  (set-face-attribute 'ediff-current-diff-B nil :inherit 'diff-added)
  (set-face-attribute 'ediff-fine-diff-A    nil :inherit 'diff-refine-removed)
  (set-face-attribute 'ediff-fine-diff-B    nil :inherit 'diff-refine-added))

(defun my/theme-choose ()
  "Prompt for and load a curated Doom theme."
  (interactive)
  (let* ((themes '(doom-one doom-dracula doom-nord doom-moonlight doom-gruvbox))
         (choice (intern (completing-read "Theme: " (mapcar #'symbol-name themes)))))
    (setq doom-theme choice)
    (doom/reload-theme)))

(message "✅ ui.el loaded")
(provide 'config-ui)
