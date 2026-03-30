(use-package! pdf-tools
  :config
  ;;(pdf-tools-install)
  (setq pdf-view-display-size 'fit-page
        pdf-view-use-scaling nil))
(map! :map pdf-view-mode-map
      :n "j" #'pdf-view-next-line-or-next-page
      :n "k" #'pdf-view-previous-line-or-previous-page
      :n "h" #'image-backward-hscroll
      :n "l" #'image-forward-hscroll
      :n "g g" #'pdf-view-first-page
      :n "G"   #'pdf-view-last-page)
(defun my/open-pdf-in-zathura ()
  "Open the current PDF in Zathura."
  (interactive)
  (let ((file (buffer-file-name)))
    (start-process "zathura" nil "zathura" file)))

(defun my/launch-zathura-prompt ()
  "Prompt for a PDF file and open it in Zathura."
  (interactive)
  (let ((file (read-file-name "Open PDF in Zathura: " nil nil t nil
                              (lambda (f) (string-match-p "\\.pdf\\'" f)))))
    (start-process "zathura" nil "zathura" (expand-file-name file))))

(defun my/open-pdf-in-zathura-and-close ()
  "Open the current PDF in Zathura and close the buffer in Emacs."
  (interactive)
  (if (not (buffer-file-name))
      (message "This buffer is not visiting a file.")
    (start-process "zathura" nil "zathura" (buffer-file-name))
    (kill-buffer (current-buffer))))

(defun my/consult-pdf-zathura ()
  "Prompt for directory, then fuzzy search PDFs and open in Zathura."
  (interactive)
  (require 'consult)
  (let* ((dir (read-directory-name "Select directory: " default-directory))
         (file (consult--read
                (directory-files-recursively dir "\\.pdf$")
                :prompt "Open PDF in Zathura: ")))
    (start-process "zathura" nil "zathura" (expand-file-name file))))
(message "pdf-tools-enhancements.el loaded")
(provide 'pdf-tools-enhancements)
