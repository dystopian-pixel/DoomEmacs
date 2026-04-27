;;; file-templates.el --- Templates config -*- lexical-binding: t; -*-

(setq +file-templates-dir (expand-file-name "snippets" doom-user-dir))

(require 'yasnippet)

(defun my/expand-new-file-snippet-if-empty ()
  "Expand a snippet automatically for a brand new empty file by extension."
  (when (and (bound-and-true-p yas-minor-mode)
             (buffer-file-name)
             (= (point-min) (point-max)))
    (pcase (downcase (or (file-name-extension (buffer-file-name)) ""))
      ("py"
       (when-let ((snippet (yas-lookup-snippet "__" 'python-mode)))
         (yas-expand-snippet snippet)))
      ("bas"
       (when-let ((snippet (yas-lookup-snippet "__" 'basic-generic-mode)))
         (yas-expand-snippet snippet)))
      ("c"
       (when-let ((snippet (yas-lookup-snippet "__c" 'c-mode)))
         (yas-expand-snippet snippet)))
      ((or "cc" "cpp" "cxx")
       (when-let ((snippet (yas-lookup-snippet "__cpp" 'c++-mode)))
         (yas-expand-snippet snippet))))))

(add-hook 'find-file-hook #'my/expand-new-file-snippet-if-empty)

(defun my/refontify-c-family-after-template-h ()
  "Refresh mode and font-lock after inserting a C/C++ file template."
  (when (and buffer-file-name
             (member (downcase (or (file-name-extension buffer-file-name) ""))
                     '("c" "cc" "cpp" "cxx" "h" "hh" "hpp" "hxx")))
    (font-lock-flush)
    (font-lock-ensure)))

(add-hook 'yas-after-exit-snippet-hook #'my/refontify-c-family-after-template-h)

(message "✅ file-templates.el loaded")
(provide 'file-templates)
;;; file-templates.el ends here
