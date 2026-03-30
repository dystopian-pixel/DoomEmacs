;; generate-doom-css.el  -*- lexical-binding:t; -*-
(require 'color)

(defun gt--hex (col fallback)
  (let* ((s (cond ((stringp col) col) ((null col) fallback) (t fallback)))
         (rgb (and s (ignore-errors (color-name-to-rgb s)))))
    (if (and rgb (= (length rgb) 3))
        (apply #'format "#%02x%02x%02x"
               (mapcar (lambda (x) (truncate (* 255 x))) rgb))
      fallback)))

(defun gt--fg (face)
  (or (face-foreground face nil t) (frame-parameter nil 'foreground-color)))
(defun gt--bg (face)
  (or (face-background face nil t) (frame-parameter nil 'background-color)))

(defun gt-css-for-theme (theme)
  (load-theme theme t)
  (let* ((bg  (or (gt--bg 'default)   "#000000"))
         (fg  (or (gt--fg 'default)   "#ffffff"))
         (mut (or (gt--fg 'font-lock-comment-face)
                  (gt--fg 'shadow) fg))
         (acc (or (gt--fg 'font-lock-keyword-face)
                  (gt--fg 'success) fg)))
    (format ":root{--bg:%s;--fg:%s;--accent:%s;--muted:%s}\n"
            (gt--hex bg "#000000")
            (gt--hex fg "#ffffff")
            (gt--hex acc "#00aaff")
            (gt--hex mut "#888888"))))

(defun doom-export-themes-css (themes out-dir)
  ;; make sure custom themes are visible
  (add-to-list 'custom-theme-load-path (expand-file-name "~/.doom.d/themes"))
  ;; load doom-themes if available (non-fatal if missing)
  (ignore-errors
    (dolist (dir (append (file-expand-wildcards "~/.emacs.d/.local/straight/build*/doom-themes")
                         (file-expand-wildcards "~/.emacs.d/straight/build*/doom-themes")))
      (when (file-directory-p dir) (add-to-list 'load-path dir)))
    (require 'doom-themes))
  (unless (file-directory-p out-dir) (make-directory out-dir t))
  (dolist (th themes)
    (let* ((name (if (symbolp th) (symbol-name th) th))
           (slug (downcase (replace-regexp-in-string "[^a-z0-9]+" "-" name)))
           (file (expand-file-name (format "%s.css" slug) out-dir)))
      (condition-case err
          (with-temp-file file (insert (gt-css-for-theme (intern name))))
        (error (message "Skip %s: %s" name (error-message-string err)))))))

