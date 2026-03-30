;;; file-templates.el --- Templates config -*- lexical-binding: t; -*-

(setq +file-templates-dir (expand-file-name "snippets" doom-user-dir))

(after! file-templates
  (set-file-templates!
   '(("\\.py$"  :mode python-mode)
     ("\\.cpp$" :mode c++-mode :trigger "__cpp")
     ("\\.bas$" :mode basic-generic-mode)
     ("\\.c$"   :mode c-mode :trigger "__c"))))

(require 'yasnippet)

(add-hook 'find-file-hook
          (lambda ()
            (when (and (eq major-mode 'basic-generic-mode)
                       (bound-and-true-p yas-minor-mode)
                       (buffer-file-name)
                       (= (point-min) (point-max)))
              (yas-expand-snippet
               (yas-lookup-snippet "__" 'basic-generic-mode)))))

(provide 'file-templates)
;;; file-templates.el ends here
