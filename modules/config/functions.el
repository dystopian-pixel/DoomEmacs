;;; functions.el --- Doom module: config/functions  -*- lexical-binding: t; -*-

;; Loads every .el from modules/config/funcs at startup. This keeps functions.org
;; simple and prevents #+INCLUDE content from leaking into the tangled .el.

(defvar my/functions.el-root
  (file-name-directory (or load-file-name buffer-file-name))
  "Directory of this file (modules/config).")

(defun my/functions-load-each ()
  "Load all compiled/tangled helpers from ../config/funcs/*.el in a stable order."
  (let* ((funcs-dir (expand-file-name "funcs" my/functions.el-root))
         (files (when (file-directory-p funcs-dir)
                  (directory-files funcs-dir t "\\.el\\'"))))
    (dolist (f (sort files #'string<))
      (condition-case e
          (load f nil t)
        (error (message "⚠ functions.el: failed to load %s: %s" f e))))))

(my/functions-load-each)

(message "functions.el loaded")
(provide 'functions)
;;; functions.el ends here
