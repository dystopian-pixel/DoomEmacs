;;; keybindings.el --- Custom keybindings -*- lexical-binding: t; -*-

;; VSCode-like bindings in visual, normal, and insert modes
(map! :v "C-c" #'kill-ring-save
      :v "C-x" #'kill-region
      :v "C-v" #'yank
      :v "C-a" #'mark-whole-buffer
      :v "C-d" #'duplicate-dwim
      :v "C-z" #'undo
      :v "C-y" #'redo
      :n "C-c" #'kill-ring-save
      :n "C-x" #'kill-region
      :n "C-v" #'yank
      :n "C-a" #'mark-whole-buffer
      :n "C-d" #'duplicate-dwim
      :n "C-z" #'undo
      :n "C-y" #'redo
      :i "C-c" #'kill-ring-save
      :i "C-x" #'kill-region
      :i "C-v" #'yank
      :i "C-a" #'mark-whole-buffer
      :i "C-d" #'duplicate-dwim
      :i "C-z" #'undo
      :i "C-y" #'redo)

(map! :i "C-a" #'beginning-of-line
      :i "C-e" #'end-of-line)

(map! :leader

      (:prefix ("t" . "open/misc")
       :desc "Toggle minimap"        "m" #'my/toggle-minimap
       :desc "Toggle imenu list"     "i" #'my/toggle-imenu-list
       :desc "Toggle Treemacs"       "p" #'my/toggle-treemacs
       :desc "Toggle sidebars"       "s" #'my/toggle-sidebars
       :desc "Toggle centaur-tabs"   "t" #'centaur-tabs-mode
       :desc "Switch buffer group"   "g" #'consult-buffer
       :desc "Toggle transparency"   "T" #'my/toggle-transparency
       :desc "(Un)Comment Line"      "-" #'comment-line)

)

(map! :leader
      ;; File/project management)
      :desc "Find project file" "p f" #'projectile-find-file
      :desc "Switch buffer" "b b" #'switch-to-buffer
      :desc "Save buffer" "f s" #'save-buffer)

(map! :leader
      (:prefix ("f" . "file")
       :desc "Find file with sidebars" "f" #'my/find-file-with-sidebars
       :desc "Find file (plain)" "T" #'find-file
       :desc "Open PDF in Zathura" "z" #'my/launch-zathura-prompt
       :desc "Open in Zathura and close buffer" "Z" #'my/open-pdf-in-zathura-and-close
       :desc "Open all files in directory" "A" #'my/open-all-files-in-directory
       :desc "Window/Buffer group switch" "t g" #'consult-buffer)
)

(map! :leader
      :prefix ("f" . "file")
      :desc "Compare two files" "r" #'ediff-files
      :desc "Compare open buffers" "R" #'my/ediff-open-buffers)

(map! :leader
      (:prefix ("c" . "code")
       :desc "Compile project" "c" #'compile
       :desc "Recompile project" "r" #'recompile
       :desc "CMake Build & Run" "b" #'my/cmake-build-and-run
       :desc "Makefile Build" "m" #'my/makefile-build
       :desc "Makefile Run" "n" #'my/makefile-run)
)

 (map! :leader
      (:prefix ("w" . "windows")
       :desc "Split window below" "b" #'split-window-below
       :desc "Split window right" "r" #'split-window-right
       :desc "Split window up" "u" #'split-window-vertically
       :desc "Split window left" "l" #'split-window-horizontally
       :desc "Delete window" "d" #'delete-window
       :desc "Balance windows" "=" #'balance-windows)
)

(map!
 :n "M-<right>"     #'centaur-tabs-forward
 :n "M-<left>"      #'centaur-tabs-backward
 :n "C-<right>"     #'centaur-tabs-move-current-tab-to-right
 :n "C-<left>"      #'centaur-tabs-move-current-tab-to-left
 :n "M-S-<right>"   #'centaur-tabs-forward-group
 :n "M-S-<left>"    #'centaur-tabs-backward-group
 :n "M-<up>"        #'centaur-tabs-select-beg-tab
 :n "M-<down>"      #'centaur-tabs-select-end-tab
 :n "M-g"           #'centaur-tabs-switch-group)


;; Jump to the Nth visible Centaur tab: SPC t 1..9
(after! centaur-tabs
  (map! :leader
        (:prefix ("t" . "tabs")
         ;; top row
         :desc "Tab 1" "1" (cmd! (centaur-tabs-select-visible-nth-tab 1))
         :desc "Tab 2" "2" (cmd! (centaur-tabs-select-visible-nth-tab 2))
         :desc "Tab 3" "3" (cmd! (centaur-tabs-select-visible-nth-tab 3))
         :desc "Tab 4" "4" (cmd! (centaur-tabs-select-visible-nth-tab 4))
         :desc "Tab 5" "5" (cmd! (centaur-tabs-select-visible-nth-tab 5))
         :desc "Tab 6" "6" (cmd! (centaur-tabs-select-visible-nth-tab 6))
         :desc "Tab 7" "7" (cmd! (centaur-tabs-select-visible-nth-tab 7))
         :desc "Tab 8" "8" (cmd! (centaur-tabs-select-visible-nth-tab 8))
         :desc "Tab 9" "9" (cmd! (centaur-tabs-select-visible-nth-tab 9))
         ;; keypad
         :desc "Tab 1" "<kp-1>" (cmd! (centaur-tabs-select-visible-nth-tab 1))
         :desc "Tab 2" "<kp-2>" (cmd! (centaur-tabs-select-visible-nth-tab 2))
         :desc "Tab 3" "<kp-3>" (cmd! (centaur-tabs-select-visible-nth-tab 3))
         :desc "Tab 4" "<kp-4>" (cmd! (centaur-tabs-select-visible-nth-tab 4))
         :desc "Tab 5" "<kp-5>" (cmd! (centaur-tabs-select-visible-nth-tab 5))
         :desc "Tab 6" "<kp-6>" (cmd! (centaur-tabs-select-visible-nth-tab 6))
         :desc "Tab 7" "<kp-7>" (cmd! (centaur-tabs-select-visible-nth-tab 7))
         :desc "Tab 8" "<kp-8>" (cmd! (centaur-tabs-select-visible-nth-tab 8))
         :desc "Tab 9" "<kp-9>" (cmd! (centaur-tabs-select-visible-nth-tab 9)))))

(map! :leader
      (:prefix ("m h" . "buffer actions")
       :desc "Buffer management" "b" #'hydra-buffer/body
       :desc "Window management" "w" #'hydra-window/body
       :desc "Project" "p" #'hydra-project/body
       :desc "Org" "o" #'hydra-org/body
       :desc "Org-Agenda" "O" #'hydra-org-agenda/body
       :desc "Code" "c" #'hydra-code/body
       :desc "Syntax" "s" #'hydra-syntax/body
       :desc "Git" "g" #'hydra-git/body
       :desc "Shell" "S" #'hydra-shell/body
       :desc "Folding" "f" #'hydra-folding/body
       :desc "Themes" "T" #'hydra-themes/body
       :desc "Theme gallery" "G" #'my/open-theme-gallery
       :desc "Tabs" "t" #'hydra-centaur-tabs/body)
)

(map! :map pdf-view-mode-map
      :leader
      :prefix ("o" . "open")
      :desc "PDF outline" "g" #'pdf-outline)

(map! :map pdf-view-mode-map
      :n "g g" #'pdf-view-goto-page)

(general-define-key
 :states 'normal
 :prefix "SPC t p"
 "d" #'pdf-view-midnight-minor-mode
 "m" #'pdf-view-themed-minor-mode
 "w" #'pdf-view-fit-width-to-window
 "p" #'pdf-view-fit-page-to-window)

(map! :map pdf-view-mode-map
      :leader
      :prefix ("o" . "open")
      :desc "Open in Zathura" "z" #'my/open-pdf-in-zathura)

(general-define-key
 :states 'normal
 :prefix "SPC f v"
 "z" #'my/consult-pdf-zathura)

(map! :leader
      (:prefix ("o a" . "org")
       :desc "Agenda"           "a" #'org-agenda
       :desc "Capture"          "c" #'org-capture
       :desc "Today"            "t" (lambda! () (interactive) (org-agenda nil "t"))
       :desc "Next actions"     "n" (lambda! () (interactive) (org-agenda nil "n"))
       :desc "Deadlines"        "d" (lambda! () (interactive) (org-agenda nil "d"))
       :desc "Waiting"          "w" (lambda! () (interactive) (org-agenda nil "w"))
       :desc "Projects"         "p" (lambda! () (interactive) (org-agenda nil "p"))
       :desc "Weekly review"    "r" (lambda! () (interactive) (org-agenda nil "r"))))

(message "keybindings.el loaded")
(provide 'keybindings)
;;; keybindings.el ends here
