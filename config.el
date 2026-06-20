;;; config.el -*- lexical-binding: t; -*-


;;; Quiet native-comp background noise on Emacs 30/Nix.
(setq native-comp-async-report-warnings-errors nil
      native-comp-warning-on-missing-source nil)

(when (boundp 'native-comp-jit-compilation)
  (setq native-comp-jit-compilation nil))

(when (boundp 'native-comp-deferred-compilation)
  (setq native-comp-deferred-compilation nil))


;; Force a POSIX shell for Emacs/Doom internals, but only when launched from Fish/Nushell.
(let ((user-shell (file-name-nondirectory (or (getenv "SHELL") ""))))
  (when (member user-shell '("fish" "nu" "nushell"))
    (setq shell-file-name (or (executable-find "bash")
                              (executable-find "sh")
                              shell-file-name))
    (setenv "SHELL" shell-file-name)))

(setq-default vterm-shell (or (executable-find "fish") "/usr/bin/fish"))
(setq-default explicit-shell-file-name (or (executable-find "fish") "/usr/bin/fish"))


;; ─────────────────────────────────────────────────────────────────────────────
;; UK date display in Org (no literal <…> in the format strings)
;; ─────────────────────────────────────────────────────────────────────────────
(setq org-time-stamp-custom-formats '("%d/%m/%Y" . "%d/%m/%Y %a %H:%M")
      org-display-custom-times t
      calendar-date-style 'european)

;; ─────────────────────────────────────────────────────────────────────────────
;; Treemacs: actually disable persistence + safely remove old state
;; ─────────────────────────────────────────────────────────────────────────────
(setq treemacs-persist nil
      treemacs-persist-file nil)


;; ─────────────────────────────────────────────────────────────────────────────
;; Optional experimental/network helpers
;; ─────────────────────────────────────────────────────────────────────────────

(defvar my/enable-local-emacs-server nil
  "When non-nil, load and start the local simple-httpd Emacs helper.")

(defvar my/enable-theme-gallery nil
  "When non-nil, load the experimental theme gallery integration.")

;; ─────────────────────────────────────────────────────────────────────────────
;; Load all module config files
;; ─────────────────────────────────────────────────────────────────────────────

(when my/enable-local-emacs-server
  (load! "modules/config/local-emacs-server"))

(load! "modules/config/ui")
;;(load! "modules/config/dashboard")
(load! "modules/config/development-tools")
(load! "modules/config/language-support")
(load! "modules/config/language-development")
(load! "modules/config/file-templates")
(load! "modules/config/functions")
(load! "modules/config/hydras")
(load! "modules/config/agenda")

(when my/enable-theme-gallery
  (load! "modules/config/theme-gallery"))

(load! "modules/config/keybindings")
