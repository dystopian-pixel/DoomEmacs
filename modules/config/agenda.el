;; [[file:../org/agenda.org::*Load order & optional packages][Load order & optional packages:1]]
;;; agenda.el --- Super Org Agenda for Doom -*- lexical-binding: t; -*-

(eval-and-compile (require 'cl-lib))

;; org-super-agenda (optional but recommended)
;; Do not error if missing; we enable it conditionally.
(with-eval-after-load 'org-agenda
  (when (require 'org-super-agenda nil t)
    ;; No mode toggle here yet—enable in a later section to ensure groups are set first.
    (defvar my/org-super-agenda-available t)))
;; Load order & optional packages:1 ends here

;; [[file:../org/agenda.org::*Files & directories][Files & directories:1]]
(setq org-directory (or (getenv "ORGDIR") (expand-file-name "~/Documents/AGENDAS/"))
      org-agenda-files
      (cl-remove-if-not #'file-exists-p
        (list (expand-file-name "inbox.org"     org-directory)
              (expand-file-name "tasks.org"     org-directory)
              (expand-file-name "projects.org"  org-directory)
              (expand-file-name "calendar.org"  org-directory)
              (expand-file-name "someday.org"   org-directory))))
;; Files & directories:1 ends here

;; [[file:../org/agenda.org::*Org Capture templates][Org Capture templates:1]]
(with-eval-after-load 'org-capture
  (let ((inbox   (expand-file-name "inbox.org"   org-directory))
        (notes   (expand-file-name "notes.org"   org-directory))
        (ideas   (expand-file-name "ideas.org"   org-directory))
        (journal (expand-file-name "journal.org" org-directory)))
    (setq org-default-notes-file inbox
          org-capture-templates
          `(("t" "Task" entry
             (file+headline ,inbox "Inbox")
             "* TODO %^{Task}\n:PROPERTIES:\n:CREATED: %U\n:END:\n%?\n%i\n%a"
             :empty-lines 1 :prepend t)
            ("n" "Note" entry
             (file+headline ,notes "Notes")
             "* %^{Title}\n:PROPERTIES:\n:CREATED: %U\n:END:\n%?\n%i\n%a"
             :empty-lines 1 :prepend t)
            ("i" "Idea" entry
             (file+headline ,ideas "Ideas")
             "* %^{Idea}\n:PROPERTIES:\n:CREATED: %U\n:END:\n%?\n%i\n%a"
             :empty-lines 1 :prepend t)
            ("j" "Journal" entry
             (file+olp+datetree ,journal)
             "* %<%H:%M> %^{Heading|Journal}\n%?\n%i\n%a"
             :empty-lines 1)))))
;; Org Capture templates:1 ends here

;; [[file:../org/agenda.org::*Friendly formatting helpers][Friendly formatting helpers:1]]
(defun my/agenda--week-title ()
  "Return a friendly title like: Tue · Oct 07–Oct 13."
  (let* ((today (current-time))
         (dow   (format-time-string "%a" today))
         (start (org-read-date nil t "+0"))
         (end   (org-read-date nil t "+6")))
    (format "%s · %s–%s"
            dow
            (format-time-string "%b %d" start)
            (format-time-string "%b %d" end))))

(defun my/agenda--month-banner ()
  "Return a month banner (e.g., “October 2025”)."
  (format-time-string "%B %Y" (current-time)))

(defun my/org-agenda-format-date (date)
  "Custom date formatter for org-agenda."
  (let ((month (car date))
        (day   (cadr date)))
    (format "%s · %s %02d"
            (calendar-day-name date t)
            (calendar-month-name month t)
            day)))
;; Friendly formatting helpers:1 ends here

;; [[file:../org/agenda.org::*Visual & readability tweaks][Visual & readability tweaks:1]]
(with-eval-after-load 'org-agenda
  (setq org-agenda-prefix-format
        '((agenda  . "  %-16:c %-12t ")
          (timeline . "  %s")
          (todo     . " %i  %b ")
          (tags     . " %i  %b ")
          (search   . " %i  %b "))
        org-agenda-block-separator ?─
        org-agenda-compact-blocks t
        org-agenda-start-on-weekday 1
        org-agenda-span 'week
        org-agenda-inhibit-startup t
        org-agenda-show-future-repeats t
        org-agenda-skip-deadline-prewarning-if-scheduled t
        org-agenda-format-date #'my/org-agenda-format-date
        org-agenda-current-time-string "⭠ now"
        org-agenda-time-grid
        '((daily today require-timed)
          (800 1000 1200 1400 1600 1800)
          "......" "----------------")))
;; Visual & readability tweaks:1 ends here

;; [[file:../org/agenda.org::*Habit integration (optional)][Habit integration (optional):1]]
(with-eval-after-load 'org
  (when (require 'org-habit nil t)
    (add-to-list 'org-modules 'org-habit t)
    (setq org-habit-show-habits t
          org-habit-show-all-today t
          org-habit-graph-column 50
          org-habit-preceding-days 14
          org-habit-following-days 7)))
;; Habit integration (optional):1 ends here

;; [[file:../org/agenda.org::*Robust helper functions (skip & project logic)][Robust helper functions (skip & project logic):1]]
(defun my/org-get-todo-state ()
  "Return the TODO keyword at point, or nil."
  (org-back-to-heading t)
  (org-get-todo-state))

(defun my/org-has-active-child-task-p ()
  "Non-nil if current subtree has a child with a tasky TODO state."
  (save-excursion
    (let ((end (save-excursion (org-end-of-subtree t))))
      (forward-line 1)
      (re-search-forward
       "^\\*+\\s-+\\(TODO\\|NEXT\\|DOING\\|WAIT\\|HOLD\\)\\b" end t))))

(defun my/org-is-project-p ()
  "A project is a heading that either has the PROJECT tag or child tasks."
  (save-excursion


    (org-back-to-heading t)
    (or (member "PROJECT" (org-get-tags))
        (my/org-has-active-child-task-p))))

(defun my/org-project-has-next-p ()
  "Non-nil if this project subtree contains a NEXT/DOING task."
  (save-excursion
    (let ((end (save-excursion (org-end-of-subtree t))))
      (forward-line 1)
      (re-search-forward "^\\*+\\s-+\\(NEXT\\|DOING\\)\\b" end t))))

(defun my/org-agenda-skip-if-scheduled-or-deadline ()
  "Skip current subtree if it is scheduled or has a deadline."
  (let ((end (save-excursion (org-end-of-subtree t))))
    (when (or (org-get-scheduled-time (point))
              (org-get-deadline-time (point)))
      end)))

(defun my/org-agenda-skip-non-projects ()
  "Skip if not a project."
  (unless (my/org-is-project-p)
    (save-excursion (org-end-of-subtree t))))

(defun my/org-agenda-skip-projects ()
  "Skip if a project."
  (when (my/org-is-project-p)
    (save-excursion (org-end-of-subtree t))))

(defun my/org-agenda-skip-if-not-stuck-project ()
  "Include only projects with no NEXT/DOING child task."
  (let ((end (save-excursion (org-end-of-subtree t))))
    (if (and (my/org-is-project-p)
             (not (my/org-project-has-next-p)))
        nil
      end)))
;; Robust helper functions (skip & project logic):1 ends here

;; [[file:../org/agenda.org::*org-super-agenda groups (if available)][org-super-agenda groups (if available):1]]
(defvar my/org-super-agenda-groups
  '((:name "🕙 Today"             :time-grid t    :order 1)
    (:name "⏳ Overdue"           :deadline past  :order 2)
    (:name "⏰ Due Soon"          :deadline future:order 3)
    (:name "🚨 High Priority"     :priority "A"   :order 5)
    (:name "⚡ Medium"            :priority "B"   :order 7)
    (:name "☁️ Low Priority"      :priority "C"   :order 8))
  "Default org-super-agenda groups to use in Super Agenda views.")
;; org-super-agenda groups (if available):1 ends here

;; [[file:../org/agenda.org::*Enable org-super-agenda (only if present)][Enable org-super-agenda (only if present):1]]
(with-eval-after-load 'org-agenda
  (when (bound-and-true-p my/org-super-agenda-available)
    (org-super-agenda-mode 1)
    (setq org-super-agenda-groups my/org-super-agenda-groups)))
;; Enable org-super-agenda (only if present):1 ends here

;; [[file:../org/agenda.org::*Overview (weekly)][Overview (weekly):1]]
(with-eval-after-load 'org-agenda
  (setq org-agenda-custom-commands
        (cl-remove-duplicates
         (append org-agenda-custom-commands
                 '(("o" "Overview (Weekly)"
                    ((agenda ""
                             ((org-agenda-span 'week)
                              (org-agenda-start-on-weekday 1)
                              (org-agenda-overriding-header
                               (concat (propertize "Weekly Overview" 'face 'org-agenda-structure)
                                       "\n" (my/agenda--week-title)))))))))
         :test #'equal)))
;; Overview (weekly):1 ends here

;; [[file:../org/agenda.org::*Super Agenda (weekly, grouped)][Super Agenda (weekly, grouped):1]]
(with-eval-after-load 'org-agenda
  (setq org-agenda-custom-commands
        (cl-remove-duplicates
         (append org-agenda-custom-commands
                 '(("s" "Super Agenda (Weekly, grouped)"
                    ((agenda ""
                             ((org-agenda-span 'week)
                              (org-agenda-start-on-weekday 1)
                              (org-agenda-overriding-header
                               (concat
                                (propertize (my/agenda--month-banner) 'face 'org-agenda-structure)
                                "\n\n"
                                (propertize "Super Agenda" 'face 'org-agenda-structure)
                                "\n" (my/agenda--week-title)))
                              (org-agenda-format-date #'my/org-agenda-format-date)
                              (org-super-agenda-groups my/org-super-agenda-groups)))))))

         :test #'equal)))
;; Super Agenda (weekly, grouped):1 ends here

;; [[file:../org/agenda.org::*Focus: Today][Focus: Today:1]]
(with-eval-after-load 'org-agenda
  (setq org-agenda-custom-commands
        (cl-remove-duplicates
         (append org-agenda-custom-commands
                 '(("t" "Today (1 day)"
                    ((agenda "" ((org-agenda-span 1)))))))
         :test #'equal)))
;; Focus: Today:1 ends here

;; [[file:../org/agenda.org::*Upcoming windows][Upcoming windows:1]]
(with-eval-after-load 'org-agenda
  (dolist (spec '(("3" "Next 3 days"  3)
                  ("2" "Next 14 days" 14)))
    (setq org-agenda-custom-commands
          (cl-remove-duplicates
           (append org-agenda-custom-commands
                   (list
                    (list (nth 0 spec) (nth 1 spec)
                          (list (list 'agenda ""
                                      (list (list 'org-agenda-span (nth 2 spec))))))))
           :test #'equal))))
;; Upcoming windows:1 ends here

;; [[file:../org/agenda.org::*Deadlines & Scheduled][Deadlines & Scheduled:1]]
(with-eval-after-load 'org-agenda
  (setq org-agenda-custom-commands
        (cl-remove-duplicates
         (append org-agenda-custom-commands
                 '(("d" "Deadlines"  ((search "+DEADLINE>=\"<today>\"")))
                   ("D" "Scheduled"  ((search "+SCHEDULED>=\"<today>\"")))))
         :test #'equal)))
;; Deadlines & Scheduled:1 ends here

;; [[file:../org/agenda.org::*Inbox (unscheduled, no deadlines)][Inbox (unscheduled, no deadlines):1]]
(with-eval-after-load 'org-agenda
  (defun my/org-agenda-skip-if-has-date ()
    "Skip subtree if it has SCHEDULED or DEADLINE."
    (let ((end (save-excursion (org-end-of-subtree t))))
      (when (or (org-get-scheduled-time (point))
                (org-get-deadline-time (point)))
        end)))

  (setq org-agenda-custom-commands
        (cl-remove-duplicates
         (append org-agenda-custom-commands
                 '(("i" "Inbox (no dates)"
                    ((todo "TODO|NEXT|DOING"
                           ((org-agenda-overriding-header "Inbox (unscheduled, no deadlines)")
                            (org-agenda-skip-function #'my/org-agenda-skip-if-has-date)))))))
         :test #'equal)))
;; Inbox (unscheduled, no deadlines):1 ends here

;; [[file:../org/agenda.org::*Next actions][Next actions:1]]
(with-eval-after-load 'org-agenda
  (let ((cmd '("n" "Next Actions"
               ((todo "NEXT|DOING"
                      ((org-agenda-overriding-header "Next Actions")))))))
    (setq org-agenda-custom-commands
          (cons cmd
                (cl-remove-if (lambda (c) (equal (car c) (car cmd)))
                              org-agenda-custom-commands)))))
;; Next actions:1 ends here

;; [[file:../org/agenda.org::*Projects & Stuck projects][Projects & Stuck projects:1]]
(with-eval-after-load 'org-agenda
  (dolist (cmd
           '(("p" "Projects"
              ((tags-todo "+PROJECT/-DONE"
                          ((org-agenda-overriding-header "Projects")
                           (org-agenda-skip-function #'my/org-agenda-skip-non-projects)))))
             ("k" "Stuck Projects"
              ((tags-todo "+PROJECT/-DONE"
                          ((org-agenda-overriding-header "Stuck Projects (no NEXT/DOING)")
                           (org-agenda-skip-function #'my/org-agenda-skip-if-not-stuck-project)))))))
    (setq org-agenda-custom-commands
          (cons cmd
                (cl-remove-if (lambda (c) (equal (car c) (car cmd)))
                              org-agenda-custom-commands)))))
;; Projects & Stuck projects:1 ends here

;; [[file:../org/agenda.org::*Waiting / Delegated / Someday][Waiting / Delegated / Someday:1]]
(with-eval-after-load 'org-agenda
  (let ((cmd '("w" "Waiting"
               ((tags-todo "+TODO=\"WAIT\""
                           ((org-agenda-overriding-header "Waiting")))))))
    (setq org-agenda-custom-commands
          (cons cmd
                (cl-remove-if (lambda (c) (equal (car c) (car cmd)))
                              org-agenda-custom-commands)))))
;; Waiting / Delegated / Someday:1 ends here

;; [[file:../org/agenda.org::*Weekly Review][Weekly Review:1]]
(with-eval-after-load 'org-agenda
  (setq org-agenda-custom-commands
        (cl-remove-duplicates
         (append org-agenda-custom-commands
                 '(("r" "Weekly Review"
                    ((agenda ""
                             ((org-agenda-span 7)
                              (org-agenda-start-on-weekday 1)
                              (org-agenda-overriding-header
                               (concat (propertize "Weekly Plan" 'face 'org-agenda-structure)
                                       "\n" (my/agenda--week-title)))))
                     (todo "NEXT|DOING"
                           ((org-agenda-overriding-header "Next Actions")))
                     (tags-todo "+PROJECT/-DONE"
                                ((org-agenda-overriding-header "Projects")
                                 (org-agenda-skip-function #'my/org-agenda-skip-non-projects)))
                     (tags "+DEADLINE<=\"<+7d>\""
                           ((org-agenda-overriding-header "Upcoming Deadlines")))
                     (search "+SCHEDULED>=\"<today>\""
                             ((org-agenda-overriding-header "Scheduled")))
                     (tags "+TODO=\"WAIT\""
                           ((org-agenda-overriding-header "Waiting")))
                     (tags "+TODO=\"DELEGATED\""
                           ((org-agenda-overriding-header "Delegated")))
                     (tags "+TODO=\"SOMEDAY\""
                           ((org-agenda-overriding-header "Someday/Maybe")))))))
         :test #'equal)))
;; Weekly Review:1 ends here

;; [[file:../org/agenda.org::*Sorting preferences][Sorting preferences:1]]
(with-eval-after-load 'org-agenda
  (setq org-agenda-sorting-strategy
        '((agenda time-up priority-down category-keep)
          (todo   priority-down deadline-up)
          (tags   priority-down deadline-up)
          (search category-keep))))
;; Sorting preferences:1 ends here

;; [[file:../org/agenda.org::*Module Footer][Module Footer:1]]
(message "✅ agenda.el loaded")
(provide 'agenda)
;; Module Footer:1 ends here
