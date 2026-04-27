(use-package! pdf-tools
  :config
  ;;(pdf-tools-install)
  (setq pdf-view-display-size 'fit-page
        pdf-view-use-scaling nil))
(map! :map pdf-view-mode-map
      :n "j"  #'pdf-view-next-line-or-next-page
      :n "k"  #'pdf-view-previous-line-or-previous-page
      :n "h"  #'image-backward-hscroll
      :n "l"  #'image-forward-hscroll
      :n "gg" #'pdf-view-first-page
      :n "G"  #'pdf-view-last-page)
(defvar-local my/pdf-picker-action 'emacs
  "Action to perform when selecting a PDF from the PDF picker.")

(defun my/pdf-picker-open ()
  "Open the PDF at point according to `my/pdf-picker-action'."
  (interactive)
  (let ((file (dired-get-file-for-visit)))
    (unless (string-match-p "\\.pdf\\'" file)
      (user-error "Selected file is not a PDF: %s"
                  (file-name-nondirectory file)))
    (pcase my/pdf-picker-action
      ('emacs
       (find-file file))
      ('zathura
       (start-process "zathura" nil "zathura" file)
       (quit-window t))
      (_
       (user-error "Unknown PDF picker action: %s" my/pdf-picker-action)))))

(defun my/pdf-picker-mode-setup (action)
  "Configure the current PDF picker buffer to use ACTION."
  (setq-local my/pdf-picker-action action)
  (local-set-key (kbd "RET") #'my/pdf-picker-open)
  (message
   (pcase action
     ('emacs
      "PDF picker: RET opens PDF in Emacs")
     ('zathura
      "PDF picker: RET opens PDF in Zathura and closes this window")
     (_
      "PDF picker ready"))))

(defun my/open-pdf-picker-in-emacs ()
  "Open a PDF-only Dired picker. RET opens the selected PDF in Emacs."
  (interactive)
  (let ((dir (read-directory-name "Browse PDFs in directory: " default-directory)))
    (find-name-dired dir "*.pdf")
    (rename-buffer "*PDF Picker (Emacs)*" t)
    (my/pdf-picker-mode-setup 'emacs)))

(defun my/open-pdf-picker-in-zathura ()
  "Open a PDF-only Dired picker. RET opens the selected PDF in Zathura and closes Dired."
  (interactive)
  (let ((dir (read-directory-name "Browse PDFs in directory: " default-directory)))
    (find-name-dired dir "*.pdf")
    (rename-buffer "*PDF Picker (Zathura)*" t)
    (my/pdf-picker-mode-setup 'zathura)))

(defun my/open-pdf-in-zathura ()
  "Open the current PDF in Zathura."
  (interactive)
  (let ((file (buffer-file-name)))
    (unless (and file (string-match-p "\\.pdf\\'" file))
      (user-error "Current buffer is not visiting a PDF"))
    (start-process "zathura" nil "zathura" file)))

(defun my/open-pdf-in-zathura-and-close ()
  "Open the current PDF in Zathura and close the buffer in Emacs."
  (interactive)
  (let ((file (buffer-file-name)))
    (unless (and file (string-match-p "\\.pdf\\'" file))
      (user-error "Current buffer is not visiting a PDF"))
    (start-process "zathura" nil "zathura" file)
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
(message "☑️ pdf-tools-enhancements.el loaded")
(provide 'pdf-tools-enhancements)
