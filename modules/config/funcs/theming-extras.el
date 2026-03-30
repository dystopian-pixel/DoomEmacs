;; [[file:../../org/funcs/theming-extras.org::*Module prologue][Module prologue:1]]
;;; theming-extras.el --- Extra theme helpers -*- lexical-binding: t; -*-
;; Module prologue:1 ends here

;; [[file:../../org/funcs/theming-extras.org::*Theme gallery][Theme gallery:1]]
;;;###autoload
(defun my/open-theme-gallery ()
  "Open a theme switcher (prefers `consult-theme', falls back to `counsel-load-theme' or `load-theme')."
  (interactive)
  (cond
   ((fboundp 'consult-theme) (consult-theme))
   ((fboundp 'counsel-load-theme) (counsel-load-theme))
   (t (call-interactively #'load-theme))))
;; Theme gallery:1 ends here

;; [[file:../../org/funcs/theming-extras.org::*Toggle transparency][Toggle transparency:1]]
(defcustom my/frame-transparency 90
  "Preferred translucent background. 100 = fully opaque."
  :type 'integer :group 'appearance)

(defun my--theming--set-alpha (frame value)
  "Set FRAME transparency VALUE using the best available mechanism."
  (cond
   ;; Emacs 29+: alpha-background is preferred for Wayland/etc.
   ((and (boundp 'alpha-background)
         (or (null (frame-parameter frame 'alpha))
             (display-graphic-p frame)))
    (set-frame-parameter frame 'alpha-background value))
   ;; Legacy alpha param accepts (ACTIVE . INACTIVE) or integer
   (t
    (set-frame-parameter frame 'alpha (cons value value)))))

;;;###autoload
(defun my/toggle-transparency (&optional value)
  "Toggle frame transparency. With prefix VALUE, set that exact transparency (100 = opaque)."
  (interactive "P")
  (let* ((frame (selected-frame))
         (current (or (frame-parameter frame 'alpha-background)
                      (cdr-safe (frame-parameter frame 'alpha))
                      (car-safe (frame-parameter frame 'alpha))
                      100))
         (next (cond
                (value (prefix-numeric-value value))
                ((< current 100) 100)
                (t my/frame-transparency))))
    (my--theming--set-alpha frame next)
    (message "Transparency: %s" next)))
;; Toggle transparency:1 ends here

;; [[file:../../org/funcs/theming-extras.org::*Module epilogue][Module epilogue:1]]
(provide 'theming-extras)
;;; theming-extras.el ends here
;; Module epilogue:1 ends here
