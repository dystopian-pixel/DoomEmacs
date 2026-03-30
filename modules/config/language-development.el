;;; language-development.el --- C++ helpers -*- lexical-binding: t; -*-

(defun my/compile-cpp-project ()
  "Compile all C++ files."
  (interactive)
  (compile "g++ -std=c++17 -O2 $(find . -name '*.cpp') -o app"))

(provide 'language-development)
;;; language-development.el ends here
