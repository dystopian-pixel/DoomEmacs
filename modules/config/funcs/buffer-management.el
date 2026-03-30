(defun my/kill-all-buffers-and-close-sidebars ()
  "Kill all buffers and close Treemacs and Minimap if they are open."
  (interactive)
  (when (y-or-n-p "Really kill ALL buffers and close sidebars? ")
    (+evil:kill-all-buffers)
    (when (featurep 'treemacs)
      (dolist (win (window-list))
        (when (string-match-p "\\*Treemacs" (buffer-name (window-buffer win)))
          (delete-window win)))
      (dolist (buf (buffer-list))
        (when (string-match-p "\\*Treemacs" (buffer-name buf))
          (kill-buffer buf))))
    (when (bound-and-true-p minimap-mode)
      (minimap-mode -1))
    (message "All buffers killed and sidebars closed.")))

(defun my/kill-all-other-buffers ()
  "Kill all buffers except the current one and Treemacs buffers."
  (interactive)
  (when (y-or-n-p "Kill all OTHER buffers (keep Treemacs)? ")
    (mapc (lambda (b)
            (unless (or (eq b (current-buffer))
                        (string-match-p "\\*Treemacs" (buffer-name b)))
              (kill-buffer b)))
          (buffer-list))
    (message "Other buffers killed, Treemacs preserved.")))

(defun my/kill-unmodified-buffers ()
  "Kill all unmodified buffers."
  (interactive)
  (when (y-or-n-p "Kill all unmodified buffers?")
    (dolist (buf (buffer-list))
      (with-current-buffer buf
        (unless (buffer-modified-p)
          (kill-buffer buf))))
    (message "Unmodified buffers killed.")))
(defvar my/ediff-faces-installed nil
  "Non-nil once theme-aware Ediff faces are set up.")

(defun my/ediff--apply-faces ()
  "Apply theme-aware faces for Ediff by inheriting from `diff-*' faces."
  (custom-set-faces!
    '(ediff-current-diff-A  :inherit diff-removed         :extend t)
    '(ediff-current-diff-B  :inherit diff-added           :extend t)
    '(ediff-current-diff-C  :inherit diff-changed         :extend t)
    '(ediff-fine-diff-A     :inherit diff-refine-removed  :weight bold :extend t)
    '(ediff-fine-diff-B     :inherit diff-refine-added    :weight bold :extend t)
    '(ediff-fine-diff-C     :inherit diff-refine-changed  :weight bold :extend t)
    '(ediff-even-diff-A     :inherit shadow :extend t)
    '(ediff-odd-diff-A      :inherit shadow :extend t)
    '(ediff-even-diff-B     :inherit shadow :extend t)
    '(ediff-odd-diff-B      :inherit shadow :extend t)
    '(ediff-even-diff-C     :inherit shadow :extend t)
    '(ediff-odd-diff-C      :inherit shadow :extend t)))
(defun my/ediff-open-buffers (&optional use-visible)
  (interactive "P")
  (require 'ediff)
  (let* ((wins (window-list (selected-frame) 'no-minibuffer))
         (defaults (if (or use-visible (= (length wins) 2))
                       (list (window-buffer (nth 0 wins))
                             (window-buffer (nth 1 wins)))
                     (list (current-buffer)
                           (other-buffer (current-buffer) t))))
         (bufA (read-buffer "Ediff buffer A: "
                            (buffer-name (nth 0 defaults)) t))
         (bufB (read-buffer "Ediff buffer B: "
                            (buffer-name (nth 1 defaults)) t)))
    (when (equal bufA bufB)
      (user-error "Select two different buffers"))
    (ediff-buffers bufA bufB)))
(defun my/ediff--ensure-faces ()

  (unless (bound-and-true-p my/ediff-faces-installed)
    ;; Reapply whenever the theme changes (Doom-specific hook).
    (add-hook 'doom-load-theme-hook #'my/ediff--apply-faces)
    (setq my/ediff-faces-installed t))
  (my/ediff--apply-faces))
;; Customize the fold ellipsis display
(setq hs-set-up-overlay
      (lambda (ov)
        (when (eq 'code (overlay-get ov 'hs))
          (overlay-put ov 'display " ⯈⯈⯈ "))))

;; Start files with all folds closed (for programming modes)
(remove-hook 'prog-mode-hook #'hs-hide-all)

;; Optional: Use outline-style folding for Python
(add-hook 'python-mode-hook
  (lambda ()
    (setq-local outline-regexp " *\\(def \\|class \\)")))

;; Open folds when searching
(setq hs-isearch-open t)
(message "functions.el loaded")
(provide 'functions)
