(() => {
  "use strict";

  const VERSION = "247";

          const PREVIEW_TABS = [
    ["dashboard", "Doom Dashboard"],
    ["elisp", "Emacs Lisp"],
    ["org", "Org Mode"],
    ["cpp", "C++"],
    ["php", "PHP"],
    ["css", "CSS"],
    ["nix", "Nix"],
    ["mango", "Mango"],
    ["hyprland", "Hyprland"],
    ["niri", "Niri"],
    ["python", "Python"],
    ["basic", "BASIC"],
    ["z80", "Z80 ASM"],
    ["bashrc", ".bashrc"],
  ];

const DEFAULT_PALETTE = {
    bg: "#11111b",
    bgAlt: "#181825",
    fg: "#cdd6f4",
    fgAlt: "#bac2de",
    comments: "#6c7086",
    keywords: "#cba6f7",
    strings: "#a6e3a1",
    functions: "#89b4fa",
    variables: "#f9e2af",
    accent: "#89b4fa",
    region: "#313244",
    selectionFg: "#ffffff",
    hlLine: "#1e1e2e",
    hlLineFg: "#cdd6f4",
    modelineBg: "#181825",
    modelineFg: "#cdd6f4",
    inactiveModelineBg: "#11111b",
    inactiveModelineFg: "#6c7086",
    tabActive: "#cdd6f4",
    tabActiveBg: "#181825",
    tabInactive: "#6c7086",
    tabInactiveBg: "#11111b",
    tabBar: "#89b4fa",
    diffAdded: "#1f3f2f",
    diffRemoved: "#4a2328",
    diffChanged: "#3f355f"
  };

  const COLOR_ROLES = [
    ["bg", "Background"],
    ["bgAlt", "Alt background"],
    ["fg", "Foreground"],
    ["fgAlt", "Dim foreground"],
    ["comments", "Comments"],
    ["keywords", "Keywords"],
    ["strings", "Strings"],
    ["functions", "Functions"],
        ["variables", "Variables"],
    ["accent", "Accent"],
    ["region", "Region"],
    ["hlLine", "Current line"],
    ["hlLineFg", "Current line fg"],
    ["modelineBg", "Mode-line bg"],
    ["modelineFg", "Mode-line fg"],
    ["inactiveModelineBg", "Inactive mode-line bg"],
    ["inactiveModelineFg", "Inactive mode-line fg"],
    ["tabActive", "Active tab fg"],
    ["tabActiveBg", "Active tab bg"],
    ["tabInactive", "Inactive tab fg"],
    ["tabInactiveBg", "Inactive tab bg"],
    ["tabBar", "Active tab bar"],
    ["diffAdded", "Diff added"],
    ["diffRemoved", "Diff removed"],
    ["diffChanged", "Diff changed"]
  ];

  let activePreview = PREVIEW_TABS[0][0];

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[ch]));
  }

  function slugify(value) {
    return String(value || "my-theme")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "my-theme";
  }

  function rootPalette(root) {
    const palette = { ...DEFAULT_PALETTE };

    root.querySelectorAll("[data-tc-color]").forEach(input => {
      if (input.dataset.tcColor) {
        palette[input.dataset.tcColor] = input.value || palette[input.dataset.tcColor];
      }
    });

    return palette;
  }


const THEME_CREATOR_DEFAULT_FRAME_ALPHA = 100;

function clampFrameAlpha(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return THEME_CREATOR_DEFAULT_FRAME_ALPHA;
  return Math.max(0, Math.min(100, parsed));
}

function rootTransparency(root) {
  const slider = root.querySelector("[data-tc-transparency]");
  const number = root.querySelector("[data-tc-transparency-number]");
  return clampFrameAlpha((slider && slider.value) || (number && number.value) || THEME_CREATOR_DEFAULT_FRAME_ALPHA);
}

function syncTransparencyControls(root, source) {
  const value = clampFrameAlpha(source ? source.value : rootTransparency(root));
  const slider = root.querySelector("[data-tc-transparency]");
  const number = root.querySelector("[data-tc-transparency-number]");
  const output = root.querySelector("[data-tc-transparency-output]");
  if (slider) slider.value = String(value);
  if (number) number.value = String(value);
  if (output) output.textContent = String(value);
  return value;
}


  function draftFromRoot(root) {
    const name = root.querySelector("[data-tc-name]")?.value?.trim() || "My Theme";
    const description = root.querySelector("[data-tc-description]")?.value?.trim() || "";
    return {
      name,
      slug: slugify(name),
      description,
      palette: rootPalette(root)
    };
  }


{
  const themeCreatorV127OriginalDraftFromRoot = draftFromRoot;
  draftFromRoot = function themeCreatorV127DraftFromRoot(root) {
    const draft = themeCreatorV127OriginalDraftFromRoot(root);
    const transparency = rootTransparency(root);
    return {
      ...draft,
      transparency,
      palette: {
        ...(draft.palette || {}),
        frameAlpha: transparency,
      },
    };
  };
}


  function setPreviewVars(root, p) {
    const target = root.querySelector("[data-tc-preview-area]") || root;

    Object.entries({
      "--tc-bg": p.bg,
      "--tc-bg-alt": p.bgAlt,
      "--tc-fg": p.fg,
      "--tc-fg-alt": p.fgAlt,
      "--tc-comments": p.comments,
      "--tc-keywords": p.keywords,
      "--tc-strings": p.strings,
      "--tc-functions": p.functions,
      "--tc-variables": p.variables,
      "--tc-accent": p.accent,
      "--tc-region": p.region,
      "--tc-hl-line": p.hlLine,
      "--tc-hl-line-fg": p.hlLineFg,
      "--tc-modeline-bg": p.modelineBg,
      "--tc-modeline-fg": p.modelineFg,
      "--tc-inactive-modeline-bg": p.inactiveModelineBg,
      "--tc-inactive-modeline-fg": p.inactiveModelineFg,
      "--tc-tab-active": p.tabActive,
      "--tc-tab-active-bg": p.tabActiveBg,
      "--tc-tab-inactive": p.tabInactive,
      "--tc-tab-inactive-bg": p.tabInactiveBg,
      "--tc-tab-bar": p.tabBar,
      "--tc-diff-added": p.diffAdded,
      "--tc-diff-removed": p.diffRemoved,
      "--tc-diff-changed": p.diffChanged
    }).forEach(([key, value]) => target.style.setProperty(key, value));
  }

  function fillToLength(lines, min, kind) {
    const out = [...lines].filter(line => {
      const text = String(line).trim();
      return text &&
        !/Extended preview area|Active tab cycling|Current-line, diff|This extra content|EXTRA BASIC PREVIEW LINES|EXTRA Z80 PREVIEW LINES/.test(text) &&
        !/^(;;|\/\/|#|;|REM)\s*$/.test(text);
    });

    function block(pass) {
      if (kind === "elisp") {
        return [
          `(use-package! ${pass % 2 ? "magit" : "consult"}`,
          "  :defer t",
          "  :init",
          `  (setq ${pass % 2 ? "magit-display-buffer-function" : "consult-preview-key"} ${pass % 2 ? "#'magit-display-buffer-same-window-except-diff-v1" : "'any"})`,
          "  :config",
          `  (add-hook! '${pass % 2 ? "magit-mode-hook" : "minibuffer-setup-hook"}`,
          `    (defun theme-preview-refresh-${pass} ()`,
          "      (setq-local line-spacing 0.12))))",
          `(setq doom-theme '${pass % 2 ? "doom-one" : "doom-gruvbox"})`,
          `(add-to-list 'custom-theme-load-path "${pass % 2 ? "~/.config/doom/themes" : "~/.config/emacs/.local/etc/theme-gallery-preview"}")`
        ];
      }

      if (kind === "org") {
        return [
          `◉ Sprint ${pass} Review`,
          `  ○ Theme Creator pass ${pass}`,
          "    - DONE Restore preview rendering",
          "    - DONE Keep arrows beside the tab strip",
          "    - NEXT Validate installed theme faces",
          "    - TODO Compare Org buffers against live Doom",
          `  ○ Implementation detail ${pass}`,
          "    The preview uses independent panes, a current line,",
          "    a selected region, and an Ediff-style changed line.",
          "    Tab colours map directly to the selector roles."
        ];
      }

      if (kind === "cpp") {
        return [
          `class ThemePreview${pass} {`,
          "public:",
          `  explicit ThemePreview${pass}(std::string name)`,
          "      : name_(std::move(name)) {}",
          "  void add_token(std::string key, std::string value) {",
          "    tokens_.push_back({std::move(key), std::move(value)});",
          "  }",
          "  std::string describe() const {",
          "    return name_ + \" has \" + std::to_string(tokens_.size()) + \" tokens\";",
          "  }",
          "private:",
          "  std::string name_;",
          "  std::vector<ThemeToken> tokens_;",
          "};"
        ];
      }

      if (kind === "php") {
        return [
          `final class ThemeSection${pass}`,
          "{",
          "    public function __construct(private Palette $palette) {}",
          "    public function tokens(): array",
          "    {",
          "        return [",
          "            'background' => $this->palette->background,",
          "            'foreground' => $this->palette->foreground,",
          "            'accent' => $this->palette->accent,",
          "        ];",
          "    }",
          "    public function face(string $name): string",
          "    {",
          "        return $name . ':' . $this->palette->accent;",
          "    }",
          "}"
        ];
      }

      if (kind === "css") {
        return [
          `.theme-preview-${pass} {`,
          "  display: grid;",
          "  grid-template-columns: minmax(16rem, 22rem) minmax(0, 1fr);",
          "  gap: 1rem;",
          "  background: var(--background);",
          "  color: var(--foreground);",
          "  border: 1px solid var(--region);",
          "  border-radius: 12px;",
          "}",
          `.theme-preview-${pass} .active-tab {`,
          "  height: 28px;",
          "  background: var(--tab-active-bg);",
          "  color: var(--tab-active);",
          "  box-shadow: inset 0 3px 0 var(--tab-bar);",
          "}"
        ];
      }

      if (kind === "nix") {
        return [
          `  themeCreator.preview${pass} = {`,
          "    enable = true;",
          `    name = "preview-${pass}";`,
          "    palette = {",
          "      background = \"#11111b\";",
          "      foreground = \"#cdd6f4\";",
          "      accent = \"#89b4fa\";",
          "    };",
          "    integrations = [",
          "      \"doom-emacs\"",
          "      \"org-mode\"",
          "      \"centaur-tabs\"",
          "    ];",
          "  };"
        ];
      }

      if (kind === "mango") {
        return [
          `workspace_${pass}_enabled = true`,
          `workspace_${pass}_name = "theme-preview-${pass}"`,
          `workspace_${pass}_background = "#11111b"`,
          `workspace_${pass}_foreground = "#cdd6f4"`,
          `workspace_${pass}_accent = "#89b4fa"`,
          `workspace_${pass}_border = "#313244"`,
          `workspace_${pass}_padding = 12`,
          `workspace_${pass}_animation = "smooth"`
        ];
      }

      if (kind === "hyprland") {
        return [
          `workspace = ${pass}, name:theme-${pass}`,
          `bind = $mod, ${pass}, workspace, ${pass}`,
          `bind = $mod SHIFT, ${pass}, movetoworkspace, ${pass}`,
          "windowrulev2 = opacity 0.96 0.90,class:^(Emacs)$",
          "layerrule = blur, launcher",
          "animations {",
          "  enabled = true",
          "  bezier = themeCurve, 0.16, 1, 0.3, 1",
          "  animation = windows, 1, 4, themeCurve",
          "}"
        ];
      }

      if (kind === "niri") {
        return [
          `workspace "theme-${pass}"`,
          "window-rule {",
          "  match app-id=\"emacs\"",
          "  open-focused true",
          "  default-column-width { proportion 0.62; }",
          "}",
          "animations {",
          "  workspace-switch { spring damping-ratio=0.82 stiffness=620 epsilon=0.0001; }",
          "}",
          `binds { Mod+${pass} { focus-workspace "${pass}"; } }`
        ];
      }

      if (kind === "python") {
        return [
          `class ThemeRenderer${pass}:`,
          "    def __init__(self, palette: Palette) -> None:",
          "        self.palette = palette",
          "        self.cache: dict[str, str] = {}",
          "    def face(self, name: str, colour: str) -> str:",
          "        self.cache[name] = colour",
          "        return f\"{name}={colour}\"",
          "    def render(self) -> list[str]:",
          "        return [",
          "            self.face(\"default\", self.palette.foreground),",
          "            self.face(\"accent\", self.palette.accent),",
          "        ]"
        ];
      }

      if (kind === "basic") {
        return [
          `LET SLOT = ${pass}`,
          "LET FG$ = \"#CDD6F4\"",
          "LET BG$ = \"#11111B\"",
          "LET AC$ = \"#89B4FA\"",
          "PRINT \"SLOT \"; SLOT",
          "PRINT \"FOREGROUND \"; FG$",
          "PRINT \"BACKGROUND \"; BG$",
          "PRINT \"ACCENT \"; AC$",
          "FOR J = 1 TO 4",
          "PRINT \"SHADE \"; J",
          "NEXT J"
        ];
      }

      if (kind === "z80") {
        return [
          `LOAD_THEME_${pass}:`,
          "LD A,$01",
          `LD HL,PALETTE_${pass}`,
          "LD B,$08",
          `APPLY_${pass}:`,
          "LD A,(HL)",
          "INC HL",
          "DJNZ APPLY_" + pass,
          "RET",
          `PALETTE_${pass}:`,
          "DB $11,$18,$CD,$D6,$89,$B4,$FA,$00"
        ];
      }

      if (kind === "text") {
        return [
          `Section ${pass}`,
          "The preview contains enough content to scroll naturally.",
          "The active tab remains visible without requiring a click.",
          "The left and right panes keep separate scroll positions.",
          "Colour roles map directly to visible UI components.",
          "The tab bar colour appears only as the active top bar."
        ];
      }

      return [
        `value_${pass} = true`,
        `name_${pass} = "theme-preview"`,
        `foreground_${pass} = "#cdd6f4"`,
        `background_${pass} = "#11111b"`
      ];
    }

    let pass = 1;

    while (out.length < min && pass < 32) {
      if (out.length && out[out.length - 1] !== "") {
        out.push("");
      }

      out.push(...block(pass));
      pass += 1;
    }

    if (kind === "basic") {
      return out.map((line, index) => {
        const body = String(line).replace(/^\s*\d+\s+/, "");
        return `${(index + 1) * 10} ${body}`;
      });
    }

    return out;
  }





  async function fetchLiveDashboard(force) {
    if (window.themeCreatorLiveDashboardLoading) return;
    if (!force && Array.isArray(window.themeCreatorLiveDashboardLines)) return;

    window.themeCreatorLiveDashboardLoading = true;
    window.themeCreatorLiveDashboardError = null;

    if (typeof window.themeCreatorRebuild === "function") {
      window.themeCreatorRebuild();
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const endpoints = [
      "./live-dashboard.json",
      "live-dashboard.json",
      "/theme-gallery/live-dashboard.json"
    ];

    let lastError = "";

    try {
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint + "?ts=" + Date.now(), {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
            headers: { "Accept": "application/json,text/plain,*/*" }
          });

          const raw = await response.text();
          const prefix = raw.slice(0, 260).replace(/\s+/g, " ").trim();

          if (!response.ok) {
            lastError = `${endpoint} returned HTTP ${response.status}: ${prefix}`;
            continue;
          }

          let data = null;

          try {
            data = JSON.parse(raw);
          } catch (_) {
            lastError = `${endpoint} returned non-JSON: ${prefix}`;
            continue;
          }

          if (!data || data.ok === false) {
            lastError = `${endpoint} returned JSON error: ${(data && data.error) || "unknown error"}`;
            continue;
          }

          window.themeCreatorLiveDashboardLines = Array.isArray(data.lines)
            ? data.lines.slice(0, 180).map((line) => String(line).slice(0, 220))
            : [];

          if (!window.themeCreatorLiveDashboardLines.length) {
            lastError = `${endpoint} loaded, but lines was empty.`;
            continue;
          }

          window.themeCreatorLiveDashboardError = null;
          return;
        } catch (err) {
          lastError =
            `${endpoint} failed: ` +
            (err && err.name === "AbortError"
              ? "request timed out"
              : (err && err.message ? err.message : String(err)));
        }
      }

      throw new Error(lastError || "No live-dashboard.json file could be loaded.");
    } catch (err) {
      window.themeCreatorLiveDashboardLines = null;
      window.themeCreatorLiveDashboardError = err && err.message ? err.message : String(err);
    } finally {
      window.themeCreatorLiveDashboardLoading = false;
      clearTimeout(timeout);

      if (typeof window.themeCreatorRebuild === "function") {
        window.themeCreatorRebuild();
      }

      if (typeof window.themeCreatorApplyEventBridge === "function") {
        window.themeCreatorApplyEventBridge();
      }
    }
  }

function dashboardSampleLines(draft) {
    if (Array.isArray(window.themeCreatorLiveDashboardLines) &&
        window.themeCreatorLiveDashboardLines.length) {
      return window.themeCreatorLiveDashboardLines;
    }

    if (window.themeCreatorLiveDashboardLoading) {
      return [
        "Loading Doom Emacs Dashboard…",
        "",
        "Fetching your live dashboard from Emacs."
      ];
    }

    if (window.themeCreatorLiveDashboardError) {
      return [
        "Could not load the Doom Emacs Dashboard.",
        "",
        String(window.themeCreatorLiveDashboardError)
      ];
    }

    if (typeof fetchLiveDashboard === "function" &&
        !window.themeCreatorDashboardAutoFetchV212) {
      window.themeCreatorDashboardAutoFetchV212 = true;

      setTimeout(() => {
        try {
          fetchLiveDashboard(true);
        } catch (err) {
          window.themeCreatorLiveDashboardError =
            err && err.message ? err.message : String(err);
        }
      }, 0);
    }

    return [
      "Loading Doom Emacs Dashboard…",
      "",
      "Fetching your live dashboard from Emacs."
    ];
  }

function sampleLines(kind, draft) {
    
    if (kind === "dashboard") return dashboardSampleLines(draft);
const name = draft.name || "My Theme";
    const slug = draft.slug || slugify(name);

    const samples = {
      elisp: [
        ";;; config.el --- Doom Emacs theme preview",
        "(after! org",
        "  (setq org-hide-emphasis-markers t",
        "        org-pretty-entities t",
        "        org-fontify-whole-heading-line t)",
        "  (custom-set-faces!",
        "    '(org-level-1 :weight bold :height 1.28)",
        "    '(org-code :inherit fixed-pitch)))",
        "(map! :leader",
        "      :desc \"Open agenda\"",
        "      \"o a\" #'org-agenda)",
        `(defun ${slug}-reload-preview ()`,
        "  \"Reload the current theme preview.\"",
        "  (interactive)",
        `  (load-theme '${slug} t))`
      ],
      org: [
        "#+title: Doom Emacs Literate Config",
        "#+author: Local Doom Configuration",
        "#+startup: overview indent",
        "#+property: header-args:emacs-lisp :tangle yes :results silent",
        "",
        "* UI",
        "Doom UI settings live close to the top of the literate config.",
        "",
        "#+begin_src emacs-lisp",
        "(setq doom-theme 'doom-one",
        "      doom-font (font-spec :family \"Iosevka\" :size 15)",
        "      doom-variable-pitch-font (font-spec :family \"Inter\" :size 15))",
        "#+end_src",
        "",
        "** Modeline and tabs",
        "#+begin_src emacs-lisp",
        "(after! doom-modeline",
        "  (setq doom-modeline-height 28",
        "        doom-modeline-bar-width 4))",
        "",
        "(after! centaur-tabs",
        "  (setq centaur-tabs-style \"bar\"",
        "        centaur-tabs-set-icons t))",
        "#+end_src",
        "",
        "* Org",
        "Org configuration should look like a real Doom literate config buffer.",
        "",
        "#+begin_src emacs-lisp",
        "(after! org",
        "  (setq org-hide-emphasis-markers t",
        "        org-startup-indented t",
        "        org-pretty-entities t))",
        "#+end_src",
        "",
        "* Keybindings",
        "#+begin_src emacs-lisp",
        "(map! :leader",
        "      :desc \"Find file\"  \"f f\" #'find-file",
        "      :desc \"Switch buffer\" \"b b\" #'consult-buffer)",
        "#+end_src"
      ],
      cpp: [
        "#include <iostream>",
        "#include <string>",
        "#include <utility>",
        "#include <vector>",
        "struct ThemeToken {",
        "  std::string name;",
        "  std::string value;",
        "};",
        "int main() {",
        "  std::vector<ThemeToken> tokens = {{\"accent\", \"#89b4fa\"}};",
        "  for (const auto& token : tokens) {",
        "    std::cout << token.name << \" = \" << token.value << '\\n';",
        "  }",
        "}"
      ],
      php: [
        "<?php",
        "declare(strict_types=1);",
        "final class Palette",
        "{",
        "    public function __construct(",
        "        public string $background,",
        "        public string $foreground,",
        "        public string $accent",
        "    ) {}",
        "}",
        "final class ThemeRenderer",
        "{",
        "    public function __construct(private Palette $palette) {}",
        "    public function faces(): array",
        "    {",
        "        return [",
        "            'default' => $this->palette->foreground,",
        "            'background' => $this->palette->background,",
        "            'accent' => $this->palette->accent,",
        "        ];",
        "    }",
        "}",
        "$theme = new ThemeRenderer(new Palette('#11111b', '#cdd6f4', '#89b4fa'));",
        "foreach ($theme->faces() as $name => $colour) {",
        "    echo $name . ' => ' . $colour . PHP_EOL;",
        "}"
      ],
      css: [
        ":root {",
        "  --background: #11111b;",
        "  --foreground: #cdd6f4;",
        "  --accent: #89b4fa;",
        "  --region: #313244;",
        "  --tab-active: #cdd6f4;",
        "  --tab-active-bg: #181825;",
        "  --tab-inactive: #6c7086;",
        "  --tab-inactive-bg: #11111b;",
        "  --tab-bar: #89b4fa;",
        "}",
        ".theme-creator-preview {",
        "  display: grid;",
        "  grid-template-columns: minmax(18rem, 24rem) minmax(0, 1fr);",
        "  background: var(--background);",
        "  color: var(--foreground);",
        "}",
        ".centaur-tab.is-active {",
        "  height: 28px;",
        "  background: var(--tab-active-bg);",
        "  color: var(--tab-active);",
        "  box-shadow: inset 0 3px 0 var(--tab-bar);",
        "}"
      ],
      nix: [
        "{ config, pkgs, ... }:",
        "{",
        "  programs.doom-emacs.enable = true;",
        "  home.sessionVariables.EDITOR = \"emacsclient -c\";",
        "  services.emacs = {",
        "    enable = true;",
        "    package = pkgs.emacs30-pgtk;",
        "  };",
        `  xdg.configFile."doom/themes/${slug}-theme.el".source = ./themes/${slug}-theme.el;`,
        "}"
      ],
      mango: [
        "theme = \"dark\"",
        "font_family = \"JetBrainsMono Nerd Font\"",
        "border_radius = 10",
        "accent_colour = \"#89b4fa\"",
        "background_colour = \"#11111b\"",
        "foreground_colour = \"#cdd6f4\""
      ],
      hyprland: [
        "monitor=,preferred,auto,1",
        "$terminal = kitty",
        "$mod = SUPER",
        "bind = $mod, RETURN, exec, $terminal",
        "general {",
        "  gaps_in = 5",
        "  gaps_out = 12",
        "  border_size = 2",
        "}",
        "decoration {",
        "  rounding = 10",
        "}"
      ],
      niri: [
        "input {",
        "  keyboard {",
        "    xkb { layout \"us\" }",
        "  }",
        "}",
        "layout {",
        "  gaps 12",
        "  center-focused-column \"never\"",
        "}",
        "binds {",
        "  Mod+Return { spawn \"kitty\"; }",
        "}"
      ],
      python: [
        "from dataclasses import dataclass",
        "@dataclass",
        "class Palette:",
        "    background: str",
        "    foreground: str",
        "    accent: str",
        "def describe_theme(theme: Palette) -> str:",
        "    return f\"accent={theme.accent} bg={theme.background}\"",
        "palette = Palette(\"#11111b\", \"#cdd6f4\", \"#89b4fa\")",
        "print(describe_theme(palette))"
      ],
      basic: [
        `10 LET THEME$ = "${name}"`,
        "20 LET FG$ = \"#CDD6F4\"",
        "30 LET BG$ = \"#11111B\"",
        "40 LET AC$ = \"#89B4FA\"",
        "50 PRINT \"LOADING THEME \"; THEME$",
        "60 PRINT \"FOREGROUND \"; FG$",
        "70 PRINT \"BACKGROUND \"; BG$",
        "80 PRINT \"ACCENT \"; AC$",
        "90 END"
      ],
      z80: [
        "ORG $8000",
        "LD HL,MESSAGE",
        "CALL PRINT",
        "LD HL,PALETTE",
        "CALL APPLY",
        "RET",
        "MESSAGE:",
        `DB "${name.toUpperCase().slice(0, 18)}",0`,
        "PALETTE:",
        "DB $11,$18,$CD,$D6,$89,$B4,$FA,$00"
      ],
      bashrc: [
        "# ~/.bashrc — Bash startup for a Doom Emacs workflow",
        "",
        "# Preferred editor",
        "export EDITOR=\"emacsclient -c -a emacs\"",
        "export VISUAL=\"$EDITOR\"",
        "",
        "# User paths",
        "export PATH=\"$HOME/.local/bin:$HOME/bin:$HOME/.config/emacs/bin:$PATH\"",
        "",
        "# Shell options",
        "shopt -s autocd",
        "shopt -s checkwinsize",
        "shopt -s histappend",
        "",
        "# Useful aliases",
        "alias ll=\"ls -alF\"",
        "alias la=\"ls -A\"",
        "alias gs=\"git status --short\"",
        "alias doom-sync=\"doom sync\"",
        "alias doom-upgrade=\"doom upgrade\"",
        "",
        "mkcd() {",
        "  mkdir -p \"$1\" && cd \"$1\"",
        "}",
        "",
        "# Load private shell aliases",
        "if [ -f \"$HOME/.config/shell/aliases\" ]; then",
        "  source \"$HOME/.config/shell/aliases\"",
        "fi",
        "",
        "PS1='\\u@\\h:\\w\\$ '"
      ],
    };

    return fillToLength(samples[kind] || samples.elisp, {
      elisp: 126,
      org: 118,
      cpp: 124,
      php: 122,
      css: 122,
      nix: 114,
      mango: 96,
      hyprland: 112,
      niri: 112,
      python: 122,
      basic: 96,
      z80: 104,
      text: 94
    }[kind] || 96, kind).filter(line =>
      !/^\s*(;;|\/\/|#|;|REM)\s*$/.test(String(line))
    );
  }

  function buildComparison(kind, palette, draft) {
    const left = sampleLines(kind, draft);
    const right = [...left];
    const changed = new Map();

    function changedLine(line, index) {
      if (kind === "elisp") return `(setq-local ${draft.slug || "theme"}-accent "#f38ba8")`;
      if (kind === "org") return "    - NEXT Verify the active tab bar colour";
      if (kind === "cpp") return "  tokens.push_back({\"accent\", \"#f38ba8\"});";
      if (kind === "php") return "$theme = new ThemeRenderer(new Palette('#11111b', '#cdd6f4', '#f38ba8'));";
      if (kind === "css") return "  --tab-bar: #f38ba8;";
      if (kind === "nix") return "      accent = \"#f38ba8\";";
      if (kind === "mango") return "accent_colour = \"#f38ba8\"";
      if (kind === "hyprland") return "col.active_border = rgb(f38ba8)";
      if (kind === "niri") return "active-color \"#f38ba8\"";
      if (kind === "python") return "palette = Palette(\"#11111b\", \"#cdd6f4\", \"#f38ba8\")";
      if (kind === "basic") return `${(index + 1) * 10} PRINT "ACCENT #F38BA8"`;
      if (kind === "z80") return "DB $F3,$8B,$A8,$00";
      if (kind === "text") return "The modified pane shows the selected accent colour.";
      return line.replace(/#[0-9A-Fa-f]{6}/, "#f38ba8");
    }

    [8, 19, 34, 51].forEach((index, offset) => {
      if (index < right.length) {
        right[index] = changedLine(right[index], index);
        changed.set(index, offset % 3 === 0 ? "changed" : offset % 3 === 1 ? "added" : "removed");
      }
    });

    return { left, right, changed };
  }

// Theme Creator v62: syntax highlighting helpers
  function tokenSpan(className, text) {
    return `<span class="${className}">${escapeHtml(text)}</span>`;
  }

  function findCommentIndex(line, markers) {
    let inString = false;
    let escape = false;

    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];

      if (escape) {
        escape = false;
        continue;
      }

      if (ch === "\\") {
        escape = true;
        continue;
      }

      if (ch === "\"") {
        inString = !inString;
        continue;
      }

      if (!inString) {
        for (const marker of markers) {
          if (line.startsWith(marker, i)) {
            return i;
          }
        }
      }
    }

    return -1;
  }

  function commentMarkersFor(kind) {
    return {
      elisp: [";"],
      cpp: ["//"],
      php: ["//", "#"],
      nix: ["#"],
      mango: ["#"],
      hyprland: ["#"],
      niri: ["//"],
      python: ["#"],
      z80: [";"]
    }[kind] || [];
  }

  function highlightCodePart(code, kind) {
    let html = escapeHtml(code);

    if (!html) return "";

    if (kind === "elisp") {
      html = html.replace(/(\()([A-Za-z0-9_!+*\/<>=?-]+)/g, '$1<span class="tc-tok-function">$2</span>');
      html = html.replace(/\b(after!|setq|setq-local|defun|interactive|load-theme|custom-set-faces!|map!|use-package!|add-hook!|add-to-list)\b/g, '<span class="tc-tok-keyword">$1</span>');
      html = html.replace(/#&#39;([A-Za-z0-9_!+*\/<>=?-]+)/g, '#&#39;<span class="tc-tok-function">$1</span>');
      return html;
    }

    if (kind === "cpp") {
      html = html.replace(/\b([A-Za-z_][A-Za-z0-9_]*)(?=\s*\()/g, '<span class="tc-tok-function">$1</span>');
      html = html.replace(/\b(include|struct|class|public|private|return|for|if|else|while|const|auto|int|void|namespace|using|explicit|final)\b/g, '<span class="tc-tok-keyword">$1</span>');
      html = html.replace(/\b(std|string|vector|cout|size_t|ThemeToken)\b/g, '<span class="tc-tok-type">$1</span>');
      html = html.replace(/(&lt;[^&]*&gt;)/g, '<span class="tc-tok-variable">$1</span>');
      html = html.replace(/#[0-9A-Fa-f]{6}/g, '<span class="tc-tok-number">$&</span>');
      return html;
    }

    if (kind === "php") {
      html = html.replace(/(&lt;\?php|\?&gt;)/g, '<span class="tc-tok-keyword">$1</span>');
      html = html.replace(/\b(declare|strict_types|namespace|use|final|class|public|private|protected|function|return|foreach|as|new|array|string|int|bool|void|self)\b/g, '<span class="tc-tok-keyword">$1</span>');
      html = html.replace(/(\$[A-Za-z_][A-Za-z0-9_]*)/g, '<span class="tc-tok-variable">$1</span>');
      html = html.replace(/\b([A-Za-z_][A-Za-z0-9_]*)(?=\s*\()/g, '<span class="tc-tok-function">$1</span>');
      html = html.replace(/(-&gt;)([A-Za-z_][A-Za-z0-9_]*)/g, '$1<span class="tc-tok-function">$2</span>');
      html = html.replace(/#[0-9A-Fa-f]{6}/g, '<span class="tc-tok-number">$&</span>');
      return html;
    }

    if (kind === "css") {
      html = html.replace(/(@[A-Za-z-]+)/g, '<span class="tc-tok-keyword">$1</span>');
      html = html.replace(/(^|\s)([.#]?[A-Za-z_][A-Za-z0-9_-]*)(?=\s*\{)/g, '$1<span class="tc-tok-function">$2</span>');
      html = html.replace(/(--[A-Za-z0-9_-]+|[A-Za-z-]+)(?=\s*:)/g, '<span class="tc-tok-variable">$1</span>');
      html = html.replace(/#[0-9A-Fa-f]{3,8}/g, '<span class="tc-tok-number">$&</span>');
      html = html.replace(/\b(grid|flex|block|inline-flex|relative|absolute|fixed|solid|transparent|repeat|minmax|color-mix|linear-gradient|var)\b/g, '<span class="tc-tok-keyword">$1</span>');
      return html;
    }

    if (kind === "python") {
      html = html.replace(/^(\s*)@([A-Za-z_][A-Za-z0-9_]*)/g, '$1<span class="tc-tok-keyword">@$2</span>');
      html = html.replace(/\b(def|class|from|import|return|for|in|if|else|elif|try|except|with|as|self|None|True|False)\b/g, '<span class="tc-tok-keyword">$1</span>');
      html = html.replace(/\b([A-Za-z_][A-Za-z0-9_]*)(?=\s*\()/g, '<span class="tc-tok-function">$1</span>');
      html = html.replace(/\b(str|int|list|dict|Palette|dataclass)\b/g, '<span class="tc-tok-type">$1</span>');
      html = html.replace(/#[0-9A-Fa-f]{6}/g, '<span class="tc-tok-number">$&</span>');
      return html;
    }

    if (kind === "nix") {
      html = html.replace(/\b(config|pkgs|programs|services|enable|package|source|true|false|null|let|in|with)\b/g, '<span class="tc-tok-keyword">$1</span>');
      html = html.replace(/\b([A-Za-z0-9_.-]+)(?=\s*=)/g, '<span class="tc-tok-variable">$1</span>');
      html = html.replace(/#[0-9A-Fa-f]{6}/g, '<span class="tc-tok-number">$&</span>');
      return html;
    }

    if (kind === "hyprland" || kind === "mango" || kind === "niri") {
      html = html.replace(/\b(bind|monitor|general|decoration|layout|input|keyboard|binds|spawn|theme|font_family|accent_colour|background_colour|foreground_colour|workspace|window-rule|animations|enabled|gaps_in|gaps_out|border_size|rounding)\b/g, '<span class="tc-tok-keyword">$1</span>');
      html = html.replace(/\b([A-Za-z0-9_$+.-]+)(?=\s*=)/g, '<span class="tc-tok-variable">$1</span>');
      html = html.replace(/#[0-9A-Fa-f]{6}/g, '<span class="tc-tok-number">$&</span>');
      return html;
    }

    if (kind === "basic") {
      html = html.replace(/^(\s*\d+)/, '<span class="tc-tok-number">$1</span>');
      html = html.replace(/\b(LET|PRINT|FOR|TO|NEXT|END|GOSUB|RETURN|IF|THEN|DIM)\b/g, '<span class="tc-tok-keyword">$1</span>');
      html = html.replace(/#[0-9A-Fa-f]{6}/g, '<span class="tc-tok-number">$&</span>');
      return html;
    }

    if (kind === "z80") {
      html = html.replace(/\b(ORG|LD|HL|DE|BC|CALL|RET|DB|JP|JR|INC|DEC|ADD|SUB|CP|DJNZ|PUSH|POP|XOR)\b/g, '<span class="tc-tok-keyword">$1</span>');
      html = html.replace(/\$[0-9A-Fa-f]+/g, '<span class="tc-tok-number">$&</span>');
      return html;
    }

    html = html.replace(/\b(true|false|null|TODO|DONE|NEXT)\b/g, '<span class="tc-tok-keyword">$1</span>');
    html = html.replace(/#[0-9A-Fa-f]{6}/g, '<span class="tc-tok-number">$&</span>');
    return html;
  }

function highlightStringAware(code, kind) {
    let out = "";
    let i = 0;

    while (i < code.length) {
      const start = code.indexOf("\"", i);

      if (start === -1) {
        out += highlightCodePart(code.slice(i), kind);
        break;
      }

      out += highlightCodePart(code.slice(i, start), kind);

      let end = start + 1;
      let escape = false;

      while (end < code.length) {
        const ch = code[end];

        if (escape) {
          escape = false;
        } else if (ch === "\\") {
          escape = true;
        } else if (ch === "\"") {
          end += 1;
          break;
        }

        end += 1;
      }

      out += tokenSpan("tc-tok-string", code.slice(start, end));
      i = end;
    }

    return out;
  }

  
function highlightOrgLine(line) {
    const raw = String(line || "");

    if (/^\s*\*+ /.test(raw)) {
      const match = raw.match(/^(\s*)(\*+)(\s+)(.*)$/);
      const level = Math.min(6, Math.max(1, match[2].length));

      return escapeHtml(match[1]) +
        '<span class="tc-org-heading-v218 tc-org-heading-level-' + level + '-v218">' +
        escapeHtml(match[4]) +
        '</span>';
    }

    if (/^\s*-\s+\[\[.*\]\[.*\]\]/.test(raw)) {
      return escapeHtml(raw)
        .replace(/^\s*-\s+/, '<span class="tc-org-list-bullet-v218">•</span> ')
        .replace(/(\[\[[^\]]+\]\[)([^\]]+)(\]\])/g, '<span class="tc-org-link-v218">$2</span>');
    }

    if (/^\s*#\+begin_src\s+emacs-lisp\b/i.test(raw)) {
      return '<span class="tc-org-src-header-v218">emacs-lisp</span>';
    }

    if (/^\s*#\+end_src\b/i.test(raw)) {
      return '';
    }

    if (/^\s*#\+(TITLE|AUTHOR|DESCRIPTION|DATE|PROPERTY|auto_tangle|FILETAGS|KEYWORDS|STARTUP):/i.test(raw)) {
      const parts = raw.split(/:(.*)/s);
      return '<span class="tc-org-meta-key-v218">' + escapeHtml(parts[0] + ':') + '</span>' +
             '<span class="tc-org-meta-value-v218">' + escapeHtml(parts[1] || '') + '</span>';
    }

    if (/^\s*;;;/.test(raw) || /^\s*;;/.test(raw)) {
      return tokenSpan("tc-tok-comment", raw);
    }

    if (/^\s*\(|^\s*\(after!|^\s*\(setq|^\s*\(defun|^\s*\(defvar|^\s*\(custom-set-faces!|^\s*\(use-package!|^\s*\(map!/.test(raw)) {
      return '<span class="tc-org-src-line-v218">' + highlightStringAware(raw, "elisp") + '</span>';
    }

    if (/^\s*$/.test(raw)) {
      return "";
    }

    return '<span class="tc-org-prose-v218">' + escapeHtml(raw) + '</span>';
  }


  
/* Theme Creator v214 bashrc syntax highlighter begin */
function highlightBashLine(line) {
    const raw = String(line || "");
    const commentIndex =
      typeof findCommentIndex === "function"
        ? findCommentIndex(raw, ["#"])
        : raw.indexOf("#");

    const code = commentIndex >= 0 ? raw.slice(0, commentIndex) : raw;
    const comment = commentIndex >= 0 ? raw.slice(commentIndex) : "";

    let out = escapeHtml(code);

    out = out.replace(
      /\b(alias|export|source|if|then|else|elif|fi|for|in|do|done|case|esac|function|return|local|eval|test|set|shopt|unset)\b/g,
      '<span class="tc-tok-keyword">$1</span>'
    );

    out = out.replace(
      /(\$\{?[A-Za-z_][A-Za-z0-9_]*\}?)/g,
      '<span class="tc-tok-variable">$1</span>'
    );

    out = out.replace(
      /(^|\s)([A-Za-z_][A-Za-z0-9_-]*)(?=\(\s*\{)/g,
      '$1<span class="tc-tok-function">$2</span>'
    );

    return out + (comment ? tokenSpan("tc-tok-comment", comment) : "");
  }
/* Theme Creator v214 bashrc syntax highlighter end */


/* Theme Creator v215 bashrc and doom org highlighting begin */
function highlightBashLineV215(line) {
    const raw = String(line || "");
    const commentIndex =
      typeof findCommentIndex === "function"
        ? findCommentIndex(raw, ["#"])
        : raw.indexOf("#");

    const code = commentIndex >= 0 ? raw.slice(0, commentIndex) : raw;
    const comment = commentIndex >= 0 ? raw.slice(commentIndex) : "";

    let out = escapeHtml(code);

    out = out.replace(
      /\b(alias|export|source|if|then|else|elif|fi|for|in|do|done|case|esac|function|return|local|eval|test|set|shopt|unset)\b/g,
      '<span class="tc-tok-keyword">$1</span>'
    );

    out = out.replace(
      /(\$\{?[A-Za-z_][A-Za-z0-9_]*\}?)/g,
      '<span class="tc-tok-variable">$1</span>'
    );

    out = out.replace(
      /(^|\s)([A-Za-z_][A-Za-z0-9_-]*)(?=\(\s*\{)/g,
      '$1<span class="tc-tok-function">$2</span>'
    );

    out = out.replace(
      /(\bdoom(?:-[A-Za-z0-9_-]+)?\b)/g,
      '<span class="tc-tok-function">$1</span>'
    );

    return out + (comment ? tokenSpan("tc-tok-comment", comment) : "");
  }

  function highlightDoomOrgLineV215(line) {
    const raw = String(line || "");

    if (/^\s*\*+ /.test(raw)) {
      const match = raw.match(/^(\s*)(\*+)(\s+)(.*)$/);
      return escapeHtml(match[1]) +
        '<span class="tc-org-stars-v215">' + escapeHtml(match[2]) + '</span>' +
        escapeHtml(match[3]) +
        '<span class="tc-org-heading-v215">' + escapeHtml(match[4]) + '</span>';
    }

    if (/^\s*#\+(title|author|startup|property|begin_src|end_src|results?|name|caption):/i.test(raw)) {
      return '<span class="tc-org-meta-v215">' + escapeHtml(raw) + '</span>';
    }

    if (/^\s*#/.test(raw)) {
      return tokenSpan("tc-tok-comment", raw);
    }

    if (/^\s*\(|^\s*\(after!|^\s*\(setq|^\s*\(map!|^\s*;;/.test(raw)) {
      return '<span class="tc-org-src-line-v215">' + highlightStringAware(raw, "elisp") + '</span>';
    }

    return '<span class="tc-org-prose-v215">' + escapeHtml(raw) + '</span>';
  }
/* Theme Creator v215 bashrc and doom org highlighting end */


/* Theme Creator v217 bashrc highlighter begin */
function highlightBashLineV217(line) {
    const raw = String(line || "");
    const commentIndex =
      typeof findCommentIndex === "function"
        ? findCommentIndex(raw, ["#"])
        : raw.indexOf("#");

    const code = commentIndex >= 0 ? raw.slice(0, commentIndex) : raw;
    const comment = commentIndex >= 0 ? raw.slice(commentIndex) : "";

    let out = escapeHtml(code);

    out = out.replace(
      /\b(alias|export|source|if|then|else|elif|fi|for|in|do|done|case|esac|function|return|local|eval|test|set|shopt|unset)\b/g,
      '<span class="tc-tok-keyword">$1</span>'
    );

    out = out.replace(
      /(\$\{?[A-Za-z_][A-Za-z0-9_]*\}?)/g,
      '<span class="tc-tok-variable">$1</span>'
    );

    out = out.replace(
      /(^|\s)([A-Za-z_][A-Za-z0-9_-]*)(?=\(\s*\{)/g,
      '$1<span class="tc-tok-function">$2</span>'
    );

    out = out.replace(
      /(\bdoom(?:-[A-Za-z0-9_-]+)?\b)/g,
      '<span class="tc-tok-function">$1</span>'
    );

    return out + (comment ? tokenSpan("tc-tok-comment", comment) : "");
  }
/* Theme Creator v217 bashrc highlighter end */



function highlightLine(line, kind) {
    if (kind === "org") {
      return highlightOrgLine(line);
    }

    if (kind === "bashrc" || kind === "text") {
      return highlightBashLineV218(line);
    }

    if (kind === "basic" && /^\s*\d*\s*REM\b/i.test(line)) {
      return tokenSpan("tc-tok-comment", line);
    }

    const markers = commentMarkersFor(kind);
    const commentIndex = markers.length ? findCommentIndex(line, markers) : -1;

    if (commentIndex >= 0) {
      const code = line.slice(0, commentIndex);
      const comment = line.slice(commentIndex);
      return highlightStringAware(code, kind) + tokenSpan("tc-tok-comment", comment);
    }

    return highlightStringAware(line, kind);
  }

  function renderLines(lines, changed, side) {
    return lines.map((line, index) => {
      const diff = side === "right" && changed.has(index) ? ` tc-diff-${changed.get(index)}` : "";
      const current = index === 8 ? " tc-current-line" : "";
      const selected = index >= 13 && index <= 15 ? " tc-selected-line" : "";

      return `<div class="tc-code-line${diff}${current}${selected}">
        <span class="tc-ln">${index + 1}</span>
        <code>${highlightLine(line, activePreview)}</code>
      </div>`;
    }).join("");
  }

function setActivePreview(root, kind) {
    if (!PREVIEW_TABS.some(([tab]) => tab === kind)) {
      kind = PREVIEW_TABS[0][0];
    }

    activePreview = kind;

    try {
      localStorage.setItem("doom-theme-creator-preview-tab", kind);
    } catch (_) {}

    root.querySelectorAll("[data-tc-preview-tab]").forEach(button => {
      const active = button.dataset.tcPreviewTab === kind;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", active ? "true" : "false");
    });

    updatePreview(root);

    if (kind === "dashboard" && typeof fetchLiveDashboard === "function") {
      try {
        fetchLiveDashboard(true);
      } catch (err) {
        window.themeCreatorLiveDashboardError =
          err && err.message ? err.message : String(err);
        updatePreview(root);
      }
    }
  }

  function cyclePreviewTab(root, direction) {
    const tabs = PREVIEW_TABS.map(([kind]) => kind);
    const index = Math.max(0, tabs.indexOf(activePreview));
    const next = tabs[(index + direction + tabs.length) % tabs.length];
    setActivePreview(root, next);
  }


  function paintDashboardPreviewBackground(root, p) {
    const bg = (p && p.bg) || "#11111b";
    const fg = (p && p.fg) || "#cdd6f4";
    const bgAlt = (p && p.bgAlt) || "#181825";
    const area = root.querySelector("[data-tc-preview-area]");
    if (!area) return;

    root.style.setProperty("--tc-dashboard-bg-v218", bg);
    root.style.setProperty("--tc-dashboard-fg-v218", fg);
    root.style.setProperty("--tc-dashboard-bg-alt-v218", bgAlt);

    const backgrounds = [
      area.querySelector(".tc-ab"),
      ...area.querySelectorAll(".tc-pane, .tc-code, [data-tc-pane-right], .tc-dashboard-pre, .tc-dashboard-line")
    ].filter(Boolean);

    backgrounds.forEach((node) => {
      node.style.setProperty("background", bg, "important");
      node.style.setProperty("background-color", bg, "important");
    });

    area.querySelectorAll(".tc-pane, .tc-code, [data-tc-pane-right], .tc-dashboard-pre").forEach((node) => {
      node.style.setProperty("color", fg, "important");
    });
  }

  function updatePreview(root) {
    syncTransparencyControls(root);

    try {
      const draft = draftFromRoot(root);
      const frameAlpha = clampFrameAlpha(draft.transparency ?? draft.palette?.frameAlpha);
      document.documentElement.style.setProperty("--tc-frame-alpha", String(frameAlpha));
      document.documentElement.style.setProperty("--tc-frame-opacity", String(frameAlpha / 100));

      const p = draft.palette;
      setPreviewVars(root, p);

      const kind = PREVIEW_TABS.some(([tab]) => tab === activePreview) ? activePreview : "elisp";
      const comparison = buildComparison(kind, p, draft);

      const left = root.querySelector("[data-tc-pane-left]");
      const right = root.querySelector("[data-tc-pane-right]");
      const status = root.querySelector("[data-tc-status]");
      const mode = root.querySelector("[data-tc-mode]");

      const isDashboard = kind === "dashboard";
      root.classList.toggle("tc-dashboard-single-window-v218", isDashboard);

      root.style.setProperty("--tc-dashboard-bg-v218", p.bg || "#11111b");
      root.style.setProperty("--tc-dashboard-fg-v218", p.fg || "#cdd6f4");
      root.style.setProperty("--tc-dashboard-bg-alt-v218", p.bgAlt || "#181825");
      root.style.setProperty("--tc-dashboard-comments-v218", p.comments || "#6c7086");
      root.style.setProperty("--tc-dashboard-keywords-v218", p.keywords || "#cba6f7");
      root.style.setProperty("--tc-dashboard-functions-v218", p.functions || "#89b4fa");
      root.style.setProperty("--tc-dashboard-variables-v218", p.variables || "#f38ba8");

      if (isDashboard) {
        const dashboardLines =
          comparison.right && comparison.right.length
            ? comparison.right
            : comparison.left || [];

        if (left) {
          left.innerHTML = "";
          left.hidden = true;
          left.style.display = "none";
          left.setAttribute("aria-hidden", "true");
        }

        if (right) {
          right.hidden = false;
          right.style.display = "";
          right.style.gridColumn = "1 / -1";
          right.style.width = "100%";
          right.style.setProperty("background", p.bg || "#11111b", "important");
          right.style.setProperty("background-color", p.bg || "#11111b", "important");
          right.style.setProperty("color", p.fg || "#cdd6f4", "important");
          right.innerHTML = renderLines(dashboardLines, new Map(), "right");
          paintDashboardPreviewBackground(root, p);
        }

        if (right && right.parentElement) {
          right.parentElement.classList.add("tc-dashboard-single-parent-v218");
          right.parentElement.style.gridTemplateColumns = "1fr";
        }
      } else {
        if (left) {
          left.hidden = false;
          left.style.display = "";
          left.style.gridColumn = "";
          left.style.width = "";
          left.removeAttribute("aria-hidden");
          left.innerHTML = renderLines(comparison.left, comparison.changed, "left");
        }

        if (right) {
          right.hidden = false;
          right.style.display = "";
          right.style.gridColumn = "";
          right.style.width = "";
          right.style.backgroundColor = "";
          right.style.color = "";
          right.innerHTML = renderLines(comparison.right, comparison.changed, "right");
        }

        if (right && right.parentElement) {
          right.parentElement.classList.remove("tc-dashboard-single-parent-v218");
          right.parentElement.style.gridTemplateColumns = "";
        }
      }

      root.querySelectorAll("*").forEach((node) => {
        if (node.children.length) return;

        const value = String(node.textContent || "").trim();

        if (/^(Original|Modified)$/i.test(value)) {
          node.hidden = isDashboard;
          node.style.display = isDashboard ? "none" : "";
        }
      });

      if (mode) {
        const label = PREVIEW_TABS.find(([tab]) => tab === kind)?.[1] || kind;
        const count = isDashboard
          ? ((comparison.right && comparison.right.length) || (comparison.left && comparison.left.length) || 0)
          : comparison.left.length;

        mode.textContent = `${label} preview · ${count} lines`;
      }

      if (status) {
        status.textContent = `Theme Creator v${VERSION} ready`;
      }

      if (typeof window.themeCreatorV218EnsureUi === "function") {
        window.themeCreatorV218EnsureUi(root);
      }

      window.themeCreatorLastError = null;
    } catch (err) {
      window.themeCreatorLastError = err && (err.stack || err.message || String(err));
      console.error("Theme Creator updatePreview failed:", err);

      const status = root.querySelector("[data-tc-status]");
      if (status) status.textContent = `Preview failed: ${err.message || err}`;
    }
  }

  /* Theme Creator v211 categorised colour editor repair begin */
function themeCreatorColourSectionsV211() {
    return [
      {
        title: "Core",
        roles: [
          ["bg", "Background", "#11111b"],
          ["fg", "Foreground", "#cdd6f4"],
          ["fgAlt", "Secondary Foreground", "#a6adc8"],
          ["bgAlt", "Alternate Background", "#181825"],
          ["accent", "Accent", "#89b4fa"],
        ],
      },
      {
        title: "Selection & Current Line",
        roles: [
          ["region", "Selection Background", "#313244"],
          ["selectionFg", "Selection Text", "#ffffff"],
          ["hlLine", "Current Line Background", "#252535"],
          ["hlLineFg", "Current Line Text", "#cdd6f4"],
        ],
      },
      {
        title: "Syntax",
        roles: [
          ["comments", "Comments", "#6c7086"],
          ["keywords", "Keywords", "#cba6f7"],
          ["functions", "Functions", "#89b4fa"],
          ["links", "Links", "#74c7ec"],
          ["variables", "Variables", "#f38ba8"],
          ["strings", "Strings", "#a6e3a1"],
        ],
      },
      {
        title: "Mode Line",
        roles: [
          ["modelineBg", "Active Mode Line Background", "#181825"],
          ["modelineFg", "Active Mode Line Text", "#cdd6f4"],
          ["inactiveModelineBg", "Inactive Mode Line Background", "#11111b"],
          ["inactiveModelineFg", "Inactive Mode Line Text", "#6c7086"],
        ],
      },
      {
        title: "Tabs",
        roles: [
          ["tabBar", "Tab Bar Background", "#181825"],
          ["tabActiveBg", "Active Tab Background", "#11111b"],
          ["tabActiveFg", "Active Tab Text", "#cdd6f4"],
          ["tabInactiveBg", "Inactive Tab Background", "#181825"],
          ["tabInactiveFg", "Inactive Tab Text", "#a6adc8"],
          ["tabIndicator", "Tab Indicator", "#89b4fa"],
          ["tabModified", "Modified Tab", "#f9e2af"],
          ["tabClose", "Close Button", "#a6adc8"],
        ],
      },
      {
        title: "Line Numbers & Gutter",
        roles: [
          ["lineNumberBg", "Line Number Background", "#181825"],
          ["lineNumberFg", "Line Number Text", "#6c7086"],
          ["currentLineNumberBg", "Active Line Number Background", "#252535"],
          ["currentLineNumberFg", "Active Line Number Text", "#cdd6f4"],
          ["fringeBg", "Fringe / Gutter Background", "#181825"],
          ["fillColumnIndicator", "Fill Column Indicator", "#45475a"],
        ],
      },
      {
        title: "Diff / VC",
        roles: [
          ["added", "Added", "#a6e3a1"],
          ["changed", "Changed", "#f9e2af"],
          ["removed", "Removed", "#f38ba8"],
        ],
      },
    ];
  }

  function themeCreatorPaletteFallbackV211() {
    const out = {};

    themeCreatorColourSectionsV211().forEach((section) => {
      section.roles.forEach(([key, _label, fallback]) => {
        out[key] = fallback;
      });
    });

    return out;
  }

  if (typeof window !== "undefined") {
    window.themeCreatorColourSectionsV211 = themeCreatorColourSectionsV211;
    window.themeCreatorPaletteFallbackV211 = themeCreatorPaletteFallbackV211;
  }

  function colourGrid() {
    const sections = [
      ["Core", [
        ["bg", "Background", "#11111b"],
        ["fg", "Foreground", "#cdd6f4"],
        ["fgAlt", "Secondary Foreground", "#a6adc8"],
        ["bgAlt", "Alternate Background", "#181825"],
        ["accent", "Accent", "#89b4fa"],
      ]],
      ["Selection & Current Line", [
        ["region", "Selection Background", "#313244"],
        ["selectionFg", "Selection Text", "#ffffff"],
        ["hlLine", "Current Line Background", "#252535"],
        ["hlLineFg", "Current Line Text", "#cdd6f4"],
      ]],
      ["Syntax", [
        ["comments", "Comments", "#6c7086"],
        ["keywords", "Keywords", "#cba6f7"],
        ["functions", "Functions", "#89b4fa"],
        ["links", "Links", "#74c7ec"],
        ["variables", "Variables", "#f38ba8"],
        ["strings", "Strings", "#a6e3a1"],
      ]],
      ["Mode Line", [
        ["modelineBg", "Active Mode Line Background", "#181825"],
        ["modelineFg", "Active Mode Line Text", "#cdd6f4"],
        ["inactiveModelineBg", "Inactive Mode Line Background", "#11111b"],
        ["inactiveModelineFg", "Inactive Mode Line Text", "#6c7086"],
      ]],
      ["Tabs", [
        ["tabBar", "Tab Bar Background", "#181825"],
        ["tabActiveBg", "Active Tab Background", "#11111b"],
        ["tabActiveFg", "Active Tab Text", "#cdd6f4"],
        ["tabInactiveBg", "Inactive Tab Background", "#181825"],
        ["tabInactiveFg", "Inactive Tab Text", "#a6adc8"],
        ["tabIndicator", "Tab Indicator", "#89b4fa"],
        ["tabModified", "Modified Tab", "#f9e2af"],
        ["tabClose", "Close Button", "#a6adc8"],
      ]],
      ["Line Numbers & Gutter", [
        ["lineNumberBg", "Line Number Background", "#181825"],
        ["lineNumberFg", "Line Number Text", "#6c7086"],
        ["currentLineNumberBg", "Active Line Number Background", "#252535"],
        ["currentLineNumberFg", "Active Line Number Text", "#cdd6f4"],
        ["fringeBg", "Fringe / Gutter Background", "#181825"],
        ["fillColumnIndicator", "Fill Column Indicator", "#45475a"],
      ]],
      ["Diff / VC", [
        ["added", "Added", "#a6e3a1"],
        ["changed", "Changed", "#f9e2af"],
        ["removed", "Removed", "#f38ba8"],
      ]],
    ];

    const fallback = {};
    sections.forEach(([_title, roles]) => {
      roles.forEach(([key, _label, value]) => {
        fallback[key] = value;
      });
    });

    const palette =
      typeof DEFAULT_PALETTE !== "undefined" &&
      DEFAULT_PALETTE &&
      typeof DEFAULT_PALETTE === "object"
        ? DEFAULT_PALETTE
        : fallback;

    return sections.map(([title, roles]) => `
      <div class="tc-colour-category-title">${escapeHtml(title)}</div>
      ${roles.map(([key, label, fallbackValue]) => {
        const value = palette[key] || fallback[key] || fallbackValue || "#89b4fa";

        return `
          <label class="tc-colour-card" data-tc-colour-card="${escapeHtml(key)}">
            <span class="tc-colour-meta">
              <span class="tc-colour-label">${escapeHtml(label)}</span>
              <span class="tc-colour-hex" data-tc-colour-hex="${escapeHtml(key)}">${escapeHtml(String(value).toUpperCase())}</span>
            </span>
            <input
              type="color"
              data-tc-color="${escapeHtml(key)}"
              value="${escapeHtml(value)}"
              aria-label="${escapeHtml(label)}"
              title="${escapeHtml(label)}">
          </label>
        `;
      }).join("")}
    `).join("");
  }
/* Theme Creator v211 categorised colour editor repair end */


  function tabIconFor(kind) {
    return {
      elisp: "λ",
      org: "◉",
      dashboard: "D",
      cpp: "C",
      php: "php",
      css: "#",
      nix: "❄",
      mango: "M",
      hyprland: "H",
      niri: "N",
      python: "Py",
      basic: "B",
      z80: "ASM",
      bashrc: "$"
    }[kind] || "•";
  }

  function previewTabs() {
    return PREVIEW_TABS.map(([kind, label]) => {
      const active = kind === activePreview;

      return `
        <button type="button" class="tc-preview-tab${active ? " is-active" : ""}" data-tc-preview-tab="${escapeHtml(kind)}" aria-selected="${active ? "true" : "false"}">
          <span class="tc-tab-icon" aria-hidden="true">${escapeHtml(tabIconFor(kind))}</span>
          <span class="tc-tab-label">${escapeHtml(label)}</span>
        </button>
      `;
    }).join("");
  }


  function normaliseCreatorThemeNameForBackend(value) {
    let name = String(value || "").trim();

    try {
      name = name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
    } catch (_) {
      /* normalize can fail on very old engines; keep the raw string. */
    }

    name = name
      .toLowerCase()
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!name) {
      name = "my-theme";
    }

    if (!/^[a-z]/.test(name)) {
      name = "theme-" + name;
    }

    return name;
  }

  function normaliseCreatorEndpointPayload(payload) {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return payload || {};
    }

    const out = { ...payload };
    const originalName =
      out.name ||
      out.slug ||
      out.themeName ||
      out.title ||
      out.displayName ||
      "my-theme";

    const slug = normaliseCreatorThemeNameForBackend(originalName);

    out.name = slug;
    out.slug = slug;

    if ("themeName" in out) {
      out.themeName = slug;
    }

    if (!out.displayName && String(originalName || "").trim()) {
      out.displayName = String(originalName).trim();
    }

    return out;
  }

  window.themeCreatorNormaliseThemeName = normaliseCreatorThemeNameForBackend;
  window.themeCreatorNormaliseEndpointPayload = normaliseCreatorEndpointPayload;

  function themeCreatorLiveControlText(control) {
    const row = control.closest(
      ".tc-colour-row,.tc-color-row,.tc-colour-field,.tc-color-field,.tc-colour-item,.tc-color-item,.tc-field,.tc-row"
    );

    const label = row && row.querySelector("label,.tc-colour-label,.tc-color-label,.tc-label");

    return String([
      control.dataset && control.dataset.tcColour,
      control.dataset && control.dataset.tcColor,
      control.dataset && control.dataset.colour,
      control.dataset && control.dataset.color,
      control.dataset && control.dataset.role,
      control.dataset && control.dataset.key,
      control.getAttribute("name"),
      control.getAttribute("id"),
      control.getAttribute("aria-label"),
      control.getAttribute("title"),
      label && label.textContent,
      row && row.textContent
    ].filter(Boolean).join(" "))
      .replace(/#[0-9a-fA-F]{3,8}/g, "")
      .replace(/\bcurrent value\b/gi, "")
      .replace(/\bcolou?r\b/gi, "")
      .replace(/[^a-zA-Z0-9]+/g, " ")
      .trim()
      .toLowerCase();
  }

  function themeCreatorLiveControlHex(control) {
    const raw = String(
      control.value ||
      control.getAttribute("data-value") ||
      control.getAttribute("aria-valuetext") ||
      control.style.backgroundColor ||
      ""
    );

    const hex = raw.match(/#[0-9a-fA-F]{6}\b/);

    if (hex) {
      return hex[0];
    }

    const rgb = raw.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);

    if (!rgb) {
      return "";
    }

    return "#" + [rgb[1], rgb[2], rgb[3]]
      .map((n) => Math.max(0, Math.min(255, Number(n))).toString(16).padStart(2, "0"))
      .join("");
  }

  function themeCreatorLiveControlRole(control) {
    const text = themeCreatorLiveControlText(control);

    if (/\bdiff\b/.test(text) && /\badded\b/.test(text)) return "diffAdded";
    if (/\bdiff\b/.test(text) && /\bchanged\b/.test(text)) return "diffChanged";
    if (/\bdiff\b/.test(text) && /\bremoved\b/.test(text)) return "diffRemoved";

    if (/\btab\b/.test(text) && /\bactive\b/.test(text) && /\bbackground\b/.test(text)) return "tabActiveBg";
    if (/\btab\b/.test(text) && /\bactive\b/.test(text) && /\bforeground\b/.test(text)) return "tabActiveFg";
    if (/\btab\b/.test(text) && /\binactive\b/.test(text) && /\bbackground\b/.test(text)) return "tabInactiveBg";
    if (/\btab\b/.test(text) && /\binactive\b/.test(text) && /\bforeground\b/.test(text)) return "tabInactiveFg";

    if (/\bmode ?line\b/.test(text) && /\binactive\b/.test(text) && /\bbackground\b/.test(text)) return "modelineInactiveBg";
    if (/\bmode ?line\b/.test(text) && /\binactive\b/.test(text) && /\bforeground\b/.test(text)) return "modelineInactiveFg";
    if (/\bmode ?line\b/.test(text) && /\bbackground\b/.test(text)) return "modelineBg";
    if (/\bmode ?line\b/.test(text) && /\bforeground\b/.test(text)) return "modelineFg";

    if (/\bline\b/.test(text) && /\bnumber\b/.test(text) && /\bcurrent\b/.test(text)) return "lineNrCurrent";
    if (/\bline\b/.test(text) && /\bnumber\b/.test(text)) return "lineNr";

    if (/\bhl\b/.test(text) && /\bline\b/.test(text) && /\bforeground\b/.test(text)) return "hlLineFg";
    if (/\bhighlight\b/.test(text) && /\bline\b/.test(text) && /\bforeground\b/.test(text)) return "hlLineFg";
    if (/\bhl\b/.test(text) && /\bline\b/.test(text)) return "hlLine";
    if (/\bhighlight\b/.test(text) && /\bline\b/.test(text)) return "hlLine";

    if (/\bregion\b/.test(text) || /\bselection\b/.test(text)) return "region";

    if (/\balt\b/.test(text) && /\bbackground\b/.test(text)) return "bgAlt";
    if (/\bbackground\b/.test(text)) return "bg";

    if (/\bdim\b/.test(text) && /\bforeground\b/.test(text)) return "fgAlt";
    if (/\bforeground\b/.test(text)) return "fg";

    if (/\bcomment|comments\b/.test(text)) return "comments";
    if (/\baccent\b/.test(text)) return "accent";
    if (/\bkeyword|keywords\b/.test(text)) return "keyword";
    if (/\bstring|strings\b/.test(text)) return "string";
    if (/\bfunction|functions\b/.test(text)) return "function";
    if (/\btype|types\b/.test(text)) return "type";
    if (/\bvariable|variables\b/.test(text)) return "variable";
    if (/\bconstant|constants\b/.test(text)) return "constant";
    if (/\bdoc\b|\bdocumentation\b/.test(text)) return "doc";

    if (/\bred\b/.test(text)) return "red";
    if (/\bgreen\b/.test(text)) return "green";
    if (/\byellow\b/.test(text)) return "yellow";
    if (/\bblue\b/.test(text)) return "blue";
    if (/\bmagenta\b/.test(text)) return "magenta";
    if (/\bcyan\b/.test(text)) return "cyan";

    return "";
  }

  function themeCreatorEndpointPayloadWithLiveControls(payload) {
    const out = normaliseCreatorEndpointPayload(payload || {});
    const modal = document.querySelector(".tc-modal");

    if (!modal) {
      return out;
    }

    const palette = { ...(out.palette || {}) };

    const controls = [...modal.querySelectorAll(`
      input[type="color"],
      [data-tc-colour],
      [data-tc-color],
      [data-colour-role],
      [data-color-role]
    `)];

    for (const control of controls) {
      const role = themeCreatorLiveControlRole(control);
      const value = themeCreatorLiveControlHex(control);

      if (role && value) {
        palette[role] = value;
      }
    }

    const transparency = rootTransparency(modal);
  palette.frameAlpha = transparency;
  out.transparency = transparency;
  out.palette = palette;
    return out;
  }

  window.themeCreatorEndpointPayloadWithLiveControls = themeCreatorEndpointPayloadWithLiveControls;

  function encodeCreatorPayloadForBackend(payload) {
    const cleanPayload = themeCreatorEndpointPayloadWithLiveControls(payload || {});
    const json = JSON.stringify(cleanPayload);
    const bytes = new TextEncoder().encode(json);
    let binary = "";

    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }

    return btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
  }

async function postCreatorEndpoint(endpoint, payload) {
    const token = String(endpoint || "").replace(/^\/+/, "");
    const encoded = encodeCreatorPayloadForBackend(payload);
    const url = "/" + token + "/" + encoded + "?_=" + Date.now();

    /*
      The local Emacs simple-httpd servlet is declared with a single
      `payload` path argument. It expects:

        /my-theme-creator-preview/<base64url-json-token>

      not POST body data and not form data.
    */
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        "Accept": "application/json,text/plain,*/*"
      }
    });

    const raw = await response.text();
    let data = null;

    try {
      data = JSON.parse(raw);
    } catch (_) {
      data = null;
    }

    if (!response.ok || /^Theme Creator .*error:/i.test(raw) || (data && data.ok === false)) {
      throw new Error(
        (data && (data.error || data.message)) ||
        raw ||
        (token + " failed with HTTP " + response.status)
      );
    }

    return data || {
      ok: true,
      message: raw,
      text: raw,
      raw
    };
  }

function buildCreator() {
    let existing = document.querySelector(".tc-modal");

    if (existing) {
      updatePreview(existing);
      return existing;
    }

    const modal = document.createElement("div");
    modal.className = "tc-modal";
    modal.hidden = true;
    modal.innerHTML = `
      <div class="tc-dialog" role="dialog" aria-modal="true" aria-label="Theme Creator">
        <header class="tc-header">
          <div>
            <h2>Theme Creator</h2>
            <p data-tc-status>Theme Creator v${VERSION} ready</p>
          </div>
          <button type="button" class="tc-close" data-tc-close aria-label="Close">×</button>
        </header>

        <div class="tc-body">
          <aside class="tc-sidebar">
            <label class="tc-field">
              <span>Theme name</span>
              <input data-tc-name type="text" value="My Theme">
            </label>

            <label class="tc-field">
              <span>Description</span>
              <textarea data-tc-description rows="3">Created with the local Doom Theme Creator.</textarea>
            </label>

            <div class="tc-colour-grid">
              ${colourGrid()}
            </div>
      <div class="tc-transparency-row" data-tc-transparency-row>
              <div class="tc-transparency-title"><strong>Transparency</strong></div>
              <div class="tc-transparency-controls">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value="${THEME_CREATOR_DEFAULT_FRAME_ALPHA}"
                  data-tc-transparency
                  aria-label="Preview background transparency">
                <span class="tc-transparency-swatch" data-tc-transparency-swatch role="img" aria-label="Background alpha preview">
                  <span class="tc-transparency-swatch-fill"></span>
                </span>
              </div>
            </div>










            <div class="tc-actions">
              <button type="button" data-tc-save>Save draft</button>
              <button type="button" data-tc-preview>Preview</button>
              <button type="button" data-tc-install>Install</button>
              <button type="button" data-tc-reset>Reset</button>
            </div>
          </aside>

          <section class="tc-preview" data-tc-preview-area>
            <div class="tc-preview-top">
              <button type="button" class="tc-centaur-nav" data-tc-preview-nav="-1" aria-label="Previous tab">‹</button>
              <div class="tc-preview-tabs" role="tablist">
                ${previewTabs()}
              </div>
              <button type="button" class="tc-centaur-nav" data-tc-preview-nav="1" aria-label="Next tab">›</button>
            </div>

            <div class="tc-ab">
              <div class="tc-pane">
                <div class="tc-pane-title">Original</div>
                <pre class="tc-code" data-tc-pane-left></pre>
              </div>
              <div class="tc-pane">
                <div class="tc-pane-title">Modified</div>
                <pre class="tc-code" data-tc-pane-right></pre>
              </div>
            </div>

            <div class="tc-mode-line" data-tc-mode>Preview</div>
          </section>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    
  // Theme Creator v247 transparency listener.
  modal.addEventListener("input", (event) => {
    const target = event.target;
    if (!target.matches("[data-tc-transparency], [data-tc-transparency-number]")) return;

    syncTransparencyControls(modal, target);

    if (typeof window.themeCreatorApplyBrowserBackground === "function") {
      window.themeCreatorApplyBrowserBackground(modal, target);
    }

    if (typeof window.themeCreatorApplyPreviewOnlyBackground === "function") {
      window.themeCreatorApplyPreviewOnlyBackground(modal, target);
    }

    if (typeof window.themeCreatorV212EnsureCompactTransparency === "function") {
      window.themeCreatorV212EnsureCompactTransparency(modal);
    }
  });

  modal.addEventListener("input", event => {
      if (event.target.matches("[data-tc-color], [data-tc-name], [data-tc-description]")) {
        updatePreview(modal);
      }
    });

    modal.addEventListener("click", async event => {
      const target = event.target;

      if (target.closest("[data-tc-close]")) {
        modal.hidden = true;
        return;
      }

      const tab = target.closest("[data-tc-preview-tab]");
      if (tab) {
        setActivePreview(modal, tab.dataset.tcPreviewTab);
        return;
      }

      const nav = target.closest("[data-tc-preview-nav]");
      if (nav) {
        cyclePreviewTab(modal, Number(nav.dataset.tcPreviewNav || 1));
        return;
      }

      if (target.closest("[data-tc-reset]")) {
        modal.querySelectorAll("[data-tc-color]").forEach(input => {
          input.value = DEFAULT_PALETTE[input.dataset.tcColor] || input.value;
        });
        updatePreview(modal);
        return;
      }

      if (target.closest("[data-tc-save]")) {
        try { await postCreatorEndpoint("my-theme-creator-draft", modal); }
        catch (err) { modal.querySelector("[data-tc-status]").textContent = err.message || String(err); }
        return;
      }

      if (target.closest("[data-tc-preview]")) {
        try { await postCreatorEndpoint("my-theme-creator-preview", modal); }
        catch (err) { modal.querySelector("[data-tc-status]").textContent = err.message || String(err); }
        return;
      }

      if (target.closest("[data-tc-install]")) {
        try { await postCreatorEndpoint("my-theme-creator-install", modal); }
        catch (err) { modal.querySelector("[data-tc-status]").textContent = err.message || String(err); }
      }
    });

    updatePreview(modal);
    return modal;
  }

  function openThemeCreator(name = "") {
    try {
      const modal = buildCreator();
      const input = modal.querySelector("[data-tc-name]");
      const clean = String(name || "").trim();

      if (input && clean) {
        input.value = clean;
      }

      modal.hidden = false;
      updatePreview(modal);
      return true;
    } catch (err) {
      window.themeCreatorLastError = err && (err.stack || err.message || String(err));
      console.error("Theme Creator open failed:", err);
      return false;
    }
  }



/* Theme Creator v220 exports begin */
(function themeCreatorV220Exports() {
  window.themeCreatorScriptVersion = VERSION;

  if (typeof buildCreator === "function") {
    window.buildCreator = buildCreator;
    window.themeCreatorBuildCreator = buildCreator;
  }

  if (typeof updatePreview === "function") {
    window.updatePreview = updatePreview;
    window.themeCreatorUpdatePreview = updatePreview;
  }

  if (typeof openThemeCreator === "function") {
    window.openThemeCreator = openThemeCreator;
    window.themeCreatorOpenThemeCreator = openThemeCreator;
    window.themeCreatorOpen = openThemeCreator;
    window.themeCreatorV220OpenThemeCreator = openThemeCreator;
  }

  window.themeCreatorV220State = function themeCreatorV220State() {
    return {
      version: VERSION,
      scriptVersion: window.themeCreatorScriptVersion || null,
      buildCreator: typeof window.buildCreator,
      updatePreview: typeof window.updatePreview,
      openThemeCreator: typeof window.openThemeCreator,
      themeCreatorOpenThemeCreator: typeof window.themeCreatorOpenThemeCreator,
      themeCreatorOpen: typeof window.themeCreatorOpen,
      themeCreatorV220OpenThemeCreator: typeof window.themeCreatorV220OpenThemeCreator,
      v146Disabled: !!window.themeCreatorV146DisabledV220,
      v146Error: window.themeCreatorV146ErrorV220 || null,
      lastError: window.themeCreatorLastError || null,
      modalCount: document.querySelectorAll(".tc-modal").length,
    };
  };
})();
/* Theme Creator v220 exports end */










  


/* Theme Creator v133 clean background transparency begin */
(function themeCreatorTransparencyV133() {
  const DEFAULT_ALPHA = 100;

  function clampAlpha(value) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) return DEFAULT_ALPHA;
    return Math.max(0, Math.min(100, parsed));
  }

  function rootFor(node) {
    if (node && node.closest) {
      return node.closest(".tc-modal") || node.closest("[data-theme-creator]") || document;
    }
    if (node && node.querySelector) return node;
    return document;
  }

  function slugify(value) {
    return String(value || "my-theme-preview")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "my-theme-preview";
  }

  function hexToRgb(hex) {
    const match = String(hex || "").trim().match(/^#?([0-9a-fA-F]{6})$/);
    if (!match) return null;
    const v = match[1];
    return {
      r: Number.parseInt(v.slice(0, 2), 16),
      g: Number.parseInt(v.slice(2, 4), 16),
      b: Number.parseInt(v.slice(4, 6), 16),
    };
  }

  function currentAlpha(root) {
    const scope = rootFor(root);
    const slider = scope.querySelector("[data-tc-transparency]");
    const number = scope.querySelector("[data-tc-transparency-number]");
    return clampAlpha((slider && slider.value) || (number && number.value) || DEFAULT_ALPHA);
  }

  function syncAlphaControls(root, source) {
    const scope = rootFor(root);
    const alpha = clampAlpha(source ? source.value : currentAlpha(scope));

    scope.querySelectorAll("[data-tc-transparency]").forEach((input) => {
      input.value = String(alpha);
      input.setAttribute("aria-valuenow", String(alpha));
    });

    scope.querySelectorAll("[data-tc-transparency-number]").forEach((input) => {
      input.value = String(alpha);
    });

    scope.querySelectorAll("[data-tc-transparency-output]").forEach((output) => {
      output.textContent = `${alpha}%`;
    });

    return alpha;
  }

  function collectPalette(root) {
    const scope = rootFor(root);
    let palette = {};

    try {
      if (typeof rootPalette === "function") {
        palette = { ...(rootPalette(scope) || {}) };
      }
    } catch (_) {}

    scope.querySelectorAll("[data-tc-color]").forEach((input) => {
      const key = input.getAttribute("data-tc-color");
      if (key) palette[key] = input.value;
    });

    return palette;
  }

  function currentBg(root) {
    const palette = collectPalette(root);
    return palette.bg ||
      getComputedStyle(rootFor(root)).getPropertyValue("--tc-bg").trim() ||
      getComputedStyle(document.documentElement).getPropertyValue("--tc-bg").trim() ||
      "#1e1e2e";
  }

  function rgbaBg(hex, alpha) {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha / 100})`;
  }

  function applyBrowserBackground(root, source) {
    const scope = rootFor(root);
    const alpha = syncAlphaControls(scope, source);
    const solidBg = currentBg(scope);
    const transparentBg = rgbaBg(solidBg, alpha);

    // The selected background belongs to the Doom preview/code surfaces only.
    // Keep the Theme Creator shell and property-coverage cards on UI colours.
    scope.style.setProperty("--tc-preview-bg-solid", solidBg);
    scope.style.setProperty("--tc-preview-bg-transparent", transparentBg);
    scope.style.setProperty("--tc-frame-alpha", String(alpha));

    document.documentElement.style.setProperty("--tc-frame-alpha", String(alpha));

    scope.querySelectorAll("[data-tc-transparency-swatch]").forEach((swatch) => {
      const fill =
        swatch.querySelector(".tc-transparency-swatch-fill") ||
        swatch.querySelector("i") ||
        swatch.firstElementChild;
      if (fill && fill.style) {
        fill.style.backgroundColor = solidBg;
        fill.style.opacity = String(alpha / 100);
      } else {
        swatch.style.backgroundColor = transparentBg;
      }
      swatch.title = `Background alpha ${alpha}%`;
      swatch.setAttribute("aria-label", `Background alpha ${alpha}%`);
    });

    // Important: only the preview background gets alpha. Never use element
    // opacity, because that fades/desaturates text, tabs, buttons, and icons.
    const previewSelector = [
      ".theme-creator-preview",
      "[data-tc-preview]",
      ".tc-preview",
      ".tc-preview-pane"
    ].join(",");

    scope.querySelectorAll(previewSelector).forEach((preview) => {
      preview.style.opacity = "1";
      preview.style.backgroundColor = transparentBg;
      preview.style.setProperty("--tc-preview-bg-transparent", transparentBg);
      preview.style.setProperty("--tc-preview-bg-solid", solidBg);
    });

    scope.querySelectorAll(`${previewSelector} *`).forEach((child) => {
      child.style.opacity = "1";
    });

    const status = scope.querySelector("[data-tc-transparency-status]");
    if (status) status.textContent = `Background alpha ${alpha}%`;

    return alpha;
  }

  function buildBackendPayload(rootOrPayload) {
    const root = rootFor(rootOrPayload);
    let out = {};

    if (rootOrPayload && typeof rootOrPayload === "object" && !rootOrPayload.querySelector) {
      out = { ...rootOrPayload };
    } else if (typeof draftFromRoot === "function") {
      try {
        out = { ...(draftFromRoot(root) || {}) };
      } catch (_) {
        out = {};
      }
    }

    const palette = {
      ...(out.palette || {}),
      ...collectPalette(root),
    };

    const alpha = applyBrowserBackground(root);
    palette.frameAlpha = alpha;
    out.transparency = alpha;
    out.palette = palette;

    if (!out.name) {
      const nameInput = root.querySelector('[data-tc-name], [name="name"], input[name="theme-name"], input[data-field="name"]');
      out.name = nameInput && nameInput.value ? nameInput.value : "My Theme Preview";
    }

    if (!out.slug) {
      const slugInput = root.querySelector('[data-tc-slug], [name="slug"], input[name="theme-slug"], input[data-field="slug"]');
      out.slug = slugInput && slugInput.value ? slugInput.value : slugify(out.name);
    }

    return out;
  }

  function encodeBase64UrlUtf8(value) {
    const json = JSON.stringify(value);
    const bytes = new TextEncoder().encode(json);
    let binary = "";
    bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  // Replace endpoint posting with a direct, predictable implementation.
  // This avoids older wrappers that accidentally dropped the modal payload.
  postCreatorEndpoint = async function themeCreatorV133PostCreatorEndpoint(endpoint, payload) {
    const root = rootFor(payload);
    const out = buildBackendPayload(payload && payload.querySelector ? root : payload);
    const token = encodeBase64UrlUtf8(out);
    const response = await fetch(`/${endpoint}/${token}`, {
      method: "GET",
      cache: "no-store",
    });
    const text = await response.text();
    if (!response.ok || /\bfailed:/i.test(text)) {
      throw new Error(text || `${endpoint} failed with HTTP ${response.status}`);
    }
    return text;
  };

  if (typeof updatePreview === "function") {
    const originalUpdatePreview = updatePreview;
    updatePreview = function themeCreatorV133UpdatePreview(root) {
      const scope = rootFor(root);
      const result = originalUpdatePreview(root);
      applyBrowserBackground(scope);
      return result;
    };
  }

  document.addEventListener("input", (event) => {
    const target = event.target;
    if (!target || !target.matches("[data-tc-transparency], [data-tc-transparency-number], [data-tc-color]")) return;
    const root = rootFor(target);
    const isTransparency = target.matches("[data-tc-transparency], [data-tc-transparency-number]");
    applyBrowserBackground(root, isTransparency ? target : null);
    if (!isTransparency && typeof updatePreview === "function") updatePreview(root);
  }, true);

  document.addEventListener("change", (event) => {
    const target = event.target;
    if (!target || !target.matches("[data-tc-transparency], [data-tc-transparency-number], [data-tc-color]")) return;
    const root = rootFor(target);
    const isTransparency = target.matches("[data-tc-transparency], [data-tc-transparency-number]");
    applyBrowserBackground(root, isTransparency ? target : null);
    if (!isTransparency && typeof updatePreview === "function") updatePreview(root);
  }, true);

  window.themeCreatorBuildBackendPayload = buildBackendPayload;
  window.themeCreatorApplyBrowserBackground = applyBrowserBackground;
})();
/* Theme Creator v133 clean background transparency end */

/* Theme Creator v137 preview-only background begin */
(function themeCreatorPreviewOnlyBackgroundV137() {
  const DEFAULT_ALPHA = 100;

  function clampAlpha(value) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) return DEFAULT_ALPHA;
    return Math.max(0, Math.min(100, parsed));
  }

  function rootFor(node) {
    if (node && node.closest) {
      return node.closest(".tc-modal") || node.closest("[data-theme-creator]") || document;
    }
    if (node && node.querySelector) return node;
    return document;
  }

  function hexToRgb(hex) {
    const match = String(hex || "").trim().match(/^#?([0-9a-fA-F]{6})$/);
    if (!match) return null;
    const v = match[1];
    return {
      r: Number.parseInt(v.slice(0, 2), 16),
      g: Number.parseInt(v.slice(2, 4), 16),
      b: Number.parseInt(v.slice(4, 6), 16),
    };
  }

  function alphaValue(root) {
    const scope = rootFor(root);
    const slider = scope.querySelector("[data-tc-transparency]");
    const number = scope.querySelector("[data-tc-transparency-number]");
    return clampAlpha((slider && slider.value) || (number && number.value) || DEFAULT_ALPHA);
  }

  function backgroundHex(root) {
    const scope = rootFor(root);
    const bgInput = scope.querySelector('[data-tc-color="bg"]');
    if (bgInput && bgInput.value) return bgInput.value;

    try {
      if (typeof rootPalette === "function") {
        const palette = rootPalette(scope);
        if (palette && palette.bg) return palette.bg;
      }
    } catch (_) {}

    return "#1e1e2e";
  }

  function rgba(hex, alpha) {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha / 100})`;
  }

  function clearCreatorShellBackgrounds(scope) {
    const shellSelector = [
      ".tc-modal",
      ".tc-panel",
      ".tc-editor",
      ".tc-modal-body",
      ".tc-creator",
      ".theme-creator-panel",
      ".theme-creator-editor",
      ".page",
      ".content"
    ].join(",");

    const root = rootFor(scope);
    const shells = new Set();

    if (root.matches && root.matches(shellSelector)) shells.add(root);
    root.querySelectorAll(shellSelector).forEach((el) => shells.add(el));

    shells.forEach((el) => {
      el.style.removeProperty("background");
      el.style.removeProperty("background-color");
      el.style.removeProperty("--tc-bg");
      el.style.removeProperty("--tc-panel-bg");
    });

    document.documentElement.style.removeProperty("--tc-panel-bg");
    document.body && document.body.style.removeProperty("background-color");
  }

  function applyPreviewOnly(root, source) {
    const scope = rootFor(root);
    const alpha = clampAlpha(source ? source.value : alphaValue(scope));
    const solid = backgroundHex(scope);
    const transparent = rgba(solid, alpha);

    scope.querySelectorAll("[data-tc-transparency]").forEach((input) => {
      input.value = String(alpha);
      input.setAttribute("aria-valuenow", String(alpha));
    });
    scope.querySelectorAll("[data-tc-transparency-number]").forEach((input) => {
      input.value = String(alpha);
    });
    scope.querySelectorAll("[data-tc-transparency-output]").forEach((output) => {
      output.textContent = `${alpha}%`;
    });

    clearCreatorShellBackgrounds(scope);

    const previewSelector = [
      ".theme-creator-preview",
      "[data-tc-preview]",
      ".tc-preview",
      ".tc-preview-pane"
    ].join(",");

    scope.querySelectorAll(previewSelector).forEach((preview) => {
      preview.style.opacity = "1";
      preview.style.filter = "none";
      preview.style.backgroundColor = transparent;
      preview.style.setProperty("--tc-preview-bg-solid", solid);
      preview.style.setProperty("--tc-preview-bg-transparent", transparent);
    });

    scope.querySelectorAll(`${previewSelector} *`).forEach((child) => {
      child.style.opacity = "1";
      child.style.filter = "none";
    });

    const status = scope.querySelector("[data-tc-transparency-status]");
    if (status) status.textContent = `Preview background alpha ${alpha}%`;

    return alpha;
  }

  if (typeof updatePreview === "function" && !updatePreview.themeCreatorV137PreviewOnlyWrapped) {
    const previousUpdatePreview = updatePreview;
    updatePreview = function themeCreatorV137UpdatePreview(root) {
      const result = previousUpdatePreview(root);
      setTimeout(() => applyPreviewOnly(root), 0);
      return result;
    };
    updatePreview.themeCreatorV137PreviewOnlyWrapped = true;
  }

  function handleChange(event) {
    const target = event.target;
    if (!target || !target.matches("[data-tc-transparency], [data-tc-transparency-number], [data-tc-color]")) return;
    const root = rootFor(target);
    setTimeout(() => {
      applyPreviewOnly(root, target.matches("[data-tc-transparency], [data-tc-transparency-number]") ? target : null);
    }, 0);
  }

  document.addEventListener("input", handleChange, true);
  document.addEventListener("change", handleChange, true);

  window.themeCreatorApplyPreviewOnlyBackground = applyPreviewOnly;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => applyPreviewOnly(document), { once: true });
  } else {
    setTimeout(() => applyPreviewOnly(document), 0);
  }
})();
/* Theme Creator v137 preview-only background end */





/* Theme Creator v146 professional colour editor begin */
(function themeCreatorProfessionalColourEditorV146() {
    window.themeCreatorV146DisabledV220 = true;
    return false;
  }

)();
/* Theme Creator v146 professional colour editor end */



/* Theme Creator v152 single compact colour viewport begin */
(function themeCreatorSingleCompactColourViewportV152() {
  function scopeFor(node) {
    if (node && node.closest) {
      return node.closest(".tc-modal") || node.closest("[data-theme-creator]") || document;
    }
    if (node && node.querySelector) return node;
    return document;
  }

  function fieldFor(control) {
    if (!control) return null;
    return control.closest(
      "[data-tc-field], .tc-field, .field, .form-row, .tc-form-row, label, .control, .setting"
    ) || control.parentElement;
  }

  function editorFor(scope) {
    return scope.querySelector("[data-tc-colour-editor-v146], .tc-colour-editor-v146");
  }

  function insertionPoint(scope) {
    const description =
      scope.querySelector(".tc-editor textarea") ||
      scope.querySelector(".theme-creator-editor textarea") ||
      scope.querySelector("textarea");

    const descriptionField = fieldFor(description);
    if (descriptionField && descriptionField.parentElement) {
      return {
        parent: descriptionField.parentElement,
        before: descriptionField.nextSibling,
      };
    }

    const transparency =
      scope.querySelector("[data-tc-transparency]") ||
      scope.querySelector("[data-tc-transparency-number]");

    const transparencyField = fieldFor(transparency);
    if (transparencyField && transparencyField.parentElement) {
      return {
        parent: transparencyField.parentElement,
        before: transparencyField,
      };
    }

    const panel =
      scope.querySelector(".tc-editor") ||
      scope.querySelector(".theme-creator-editor") ||
      scope.querySelector(".tc-controls") ||
      scope.querySelector(".tc-sidebar") ||
      scope.querySelector(".tc-panel") ||
      scope;

    return { parent: panel, before: null };
  }

  function removeLegacyScrollPanels(scope, editor) {
    scope
      .querySelectorAll("[data-tc-colour-scroll-v151], .tc-colour-scroll-v151")
      .forEach((panel) => {
        if (editor && panel.contains(editor) && panel.parentElement) {
          panel.parentElement.insertBefore(editor, panel);
        }
        panel.remove();
      });
  }

  function removeDuplicateShells(scope, keep) {
    scope
      .querySelectorAll("[data-tc-colour-editor-shell-v152]")
      .forEach((shell) => {
        if (shell === keep) return;

        const editor = shell.querySelector("[data-tc-colour-editor-v146], .tc-colour-editor-v146");
        if (editor && keep) {
          keep.appendChild(editor);
        }
        shell.remove();
      });
  }

  function moveActionsOutsideShell(scope, shell) {
    const actions =
      scope.querySelector(".tc-actions, .theme-creator-actions, [data-tc-actions]");

    if (actions && shell && shell.contains(actions) && shell.parentElement) {
      shell.parentElement.insertBefore(actions, shell.nextSibling);
    }
  }

  function ensureSingleViewport(root = document) {
    const scope = scopeFor(root);

    if (typeof window.themeCreatorRenderProfessionalColourEditor === "function" && !editorFor(scope)) {
      try {
        window.themeCreatorRenderProfessionalColourEditor(scope);
      } catch (_) {}
    }

    let editor = editorFor(scope);
    if (!editor) return false;

    removeLegacyScrollPanels(scope, editor);

    let shell = scope.querySelector("[data-tc-colour-editor-shell-v152]");
    if (!shell) {
      shell = document.createElement("div");
      shell.className = "tc-colour-editor-shell-v152";
      shell.setAttribute("data-tc-colour-editor-shell-v152", "true");

      const point = insertionPoint(scope);
      if (!point || !point.parent) return false;

      point.parent.insertBefore(shell, point.before);
    }

    removeDuplicateShells(scope, shell);

    editor = editorFor(scope);
    if (!editor) return false;

    if (editor.parentElement !== shell) {
      shell.appendChild(editor);
    }

    editor.classList.add("tc-colour-editor-compact-v152");
    moveActionsOutsideShell(scope, shell);

    return true;
  }

  function schedule(root = document) {
    setTimeout(() => ensureSingleViewport(root), 0);
    setTimeout(() => ensureSingleViewport(root), 150);
    setTimeout(() => ensureSingleViewport(root), 500);
  }

  document.addEventListener("click", (event) => {
    if (event.target && event.target.closest("[data-theme-creator], .tc-modal, .theme-creator, button")) {
      schedule(document);
    }
  }, true);

  window.themeCreatorEnsureSingleColourViewport = ensureSingleViewport;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => schedule(document), { once: true });
  } else {
    schedule(document);
  }
})();
/* Theme Creator v152 single compact colour viewport end */





/* Theme Creator v158 lightweight UI/theme separation begin */
(function themeCreatorLightweightUiThemeSeparationV158() {
  const UI = {
    shell: "#0f111a",
    panel: "#121625",
    panelAlt: "#171b2d",
    border: "#30364f",
    button: "#242a40",
    buttonHover: "#2b334d",
    bashrc: "$",
    muted: "#8b93ad",
    accent: "#89b4fa",
  };

  const PREVIEW_SELECTORS = [
    ".theme-creator-preview",
    "[data-tc-preview]",
    ".tc-preview",
    ".tc-preview-pane"
  ].join(",");

  let raf = 0;

  function scopeFor(node) {
    if (node && node.closest) {
      return node.closest(".tc-modal") || node.closest("[data-theme-creator]") || document;
    }
    if (node && node.querySelector) return node;
    return document;
  }

  function validHex(value) {
    return /^#[0-9a-fA-F]{6}$/.test(String(value || "").trim());
  }

  function alphaFor(scope) {
    const slider = scope.querySelector("[data-tc-transparency]");
    const raw = slider && slider.value;
    const parsed = Number.parseInt(raw || "100", 10);
    return Number.isFinite(parsed) ? Math.max(0, Math.min(100, parsed)) : 100;
  }

  function backgroundFor(scope) {
    const generated = scope.querySelector('[data-v146-generated][data-tc-color="bg"]');
    const normal = scope.querySelector('[data-tc-color="bg"]');
    const value = (generated && generated.value) || (normal && normal.value);
    return validHex(value) ? value : "#11111b";
  }

  function rgba(hex, alpha) {
    const value = String(hex || "").trim().replace(/^#/, "");
    if (!/^[0-9a-fA-F]{6}$/.test(value)) return hex;

    const r = Number.parseInt(value.slice(0, 2), 16);
    const g = Number.parseInt(value.slice(2, 4), 16);
    const b = Number.parseInt(value.slice(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha / 100})`;
  }

  function setUiVariables(scope) {
    [document.documentElement, scope].forEach((el) => {
      if (!el || !el.style) return;

      el.style.setProperty("--tc-shell-bg-v158", UI.shell);
      el.style.setProperty("--tc-ui-panel-v158", UI.panel);
      el.style.setProperty("--tc-ui-panel-alt-v158", UI.panelAlt);
      el.style.setProperty("--tc-ui-border-v158", UI.border);
      el.style.setProperty("--tc-ui-button-v158", UI.button);
      el.style.setProperty("--tc-ui-button-hover-v158", UI.buttonHover);
      el.style.setProperty("--tc-ui-text-v158", UI.text);
      el.style.setProperty("--tc-ui-muted-v158", UI.muted);
      el.style.setProperty("--tc-ui-accent-v158", UI.accent);

      /*
        Keep old UI CSS variables neutral. The backend payload reads input
        values directly, so this does not affect generated Doom themes.
      */
      el.style.setProperty("--tc-bg", UI.shell);
      el.style.setProperty("--tc-panel-bg", UI.panel);
      el.style.setProperty("--tc-bg-alt", UI.panelAlt);
      el.style.setProperty("--tc-fg", UI.text);
      el.style.setProperty("--tc-muted", UI.muted);
      el.style.setProperty("--tc-accent", UI.accent);
    });
  }

  function applyPreviewBackground(scope) {
    const bg = backgroundFor(scope);
    const alpha = alphaFor(scope);
    const previewBg = rgba(bg, alpha);

    scope.querySelectorAll(PREVIEW_SELECTORS).forEach((el) => {
      el.style.setProperty("--tc-preview-bg-solid-v158", bg);
      el.style.setProperty("--tc-preview-bg-transparent-v158", previewBg);
      el.style.backgroundColor = previewBg;
      el.style.opacity = "1";
      el.style.filter = "none";
    });
  }

  function compactTransparency(scope) {
    scope.querySelectorAll(".tc-transparency-row, [data-tc-transparency-row]").forEach((row) => {
      row.classList.add("tc-transparency-compact-v158");

      row.querySelectorAll([
        "[data-tc-transparency-output]",
        "[data-tc-transparency-status]",
        "[data-tc-transparency-number]",
        "small"
      ].join(",")).forEach((el) => {
        el.classList.add("tc-hidden-v158");
      });
    });
  }

  function apply(root = document) {
    const scope = scopeFor(root);
    setUiVariables(scope);
    compactTransparency(scope);
    applyPreviewBackground(scope);
    return true;
  }

  function schedule(root = document) {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      raf = 0;
      apply(root);
    });
  }

  if (typeof updatePreview === "function" && !updatePreview.themeCreatorV158Wrapped) {
    const previousUpdatePreview = updatePreview;
    updatePreview = function themeCreatorV158UpdatePreview(root) {
      const result = previousUpdatePreview(root);
      schedule(root || document);
      return result;
    };
    updatePreview.themeCreatorV158Wrapped = true;
  }

  document.addEventListener("input", (event) => {
    if (
      event.target &&
      event.target.matches("[data-tc-color], [data-tc-transparency], [data-tc-transparency-number]")
    ) {
      schedule(scopeFor(event.target));
    }
  }, true);

  document.addEventListener("change", (event) => {
    if (
      event.target &&
      event.target.matches("[data-tc-color], [data-tc-transparency], [data-tc-transparency-number]")
    ) {
      schedule(scopeFor(event.target));
    }
  }, true);

  document.addEventListener("click", (event) => {
    if (event.target && event.target.closest(".tc-modal, [data-theme-creator], button")) {
      schedule(scopeFor(event.target));
    }
  }, true);

  window.themeCreatorV158ApplyUiThemeSeparation = apply;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => schedule(document), { once: true });
  } else {
    schedule(document);
  }
})();
/* Theme Creator v158 lightweight UI/theme separation end */

/* Theme Creator v159 comments alias and transparency panel begin */
(function themeCreatorCommentsAliasTransparencyPanelV159() {
  function scopeFor(node) {
    if (node && node.closest) {
      return node.closest(".tc-modal") || node.closest("[data-theme-creator]") || document;
    }
    if (node && node.querySelector) return node;
    return document;
  }

  function commentInput(scope) {
    return (
      scope.querySelector('[data-v146-generated][data-tc-color="comments"]') ||
      scope.querySelector('[data-tc-color="comments"]') ||
      scope.querySelector('[data-tc-color-original-v146="comments"]')
    );
  }

  function ensureCommentAlias() { return null; }

  function compactTransparencyPanel(root = document) {
    const scope = scopeFor(root);

    scope.querySelectorAll(".tc-transparency-row, [data-tc-transparency-row]").forEach((row) => {
      row.classList.add("tc-transparency-panel-v159");

      row.querySelectorAll([
        "[data-tc-transparency-output]",
        "[data-tc-transparency-status]",
        "[data-tc-transparency-number]",
        "small"
      ].join(",")).forEach((el) => {
        el.classList.add("tc-hidden-v159");
      });
    });
  }

  function apply(root = document) {
    const scope = scopeFor(root);
    ensureCommentAlias(scope);
    compactTransparencyPanel(scope);
    return true;
  }

  function schedule(root = document) {
    requestAnimationFrame(() => apply(root));
  }

  document.addEventListener("input", (event) => {
    if (
      event.target &&
      event.target.matches('[data-tc-color="comments"], [data-tc-color-original-v146="comments"], [data-tc-transparency]')
    ) {
      apply(scopeFor(event.target));
    }
  }, true);

  document.addEventListener("change", (event) => {
    if (
      event.target &&
      event.target.matches('[data-tc-color="comments"], [data-tc-color-original-v146="comments"], [data-tc-transparency]')
    ) {
      apply(scopeFor(event.target));
    }
  }, true);

  document.addEventListener("click", () => schedule(document), true);

  window.themeCreatorV159ApplyCommentsAndTransparency = apply;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => schedule(document), { once: true });
  } else {
    schedule(document);
  }
})();
/* Theme Creator v159 comments alias and transparency panel end */


/* Theme Creator v160 explicit transparency panel begin */
(function themeCreatorExplicitTransparencyPanelV160() {
  function scopeFor(node) {
    if (node && node.closest) {
      return node.closest(".tc-modal") || node.closest("[data-theme-creator]") || document;
    }
    if (node && node.querySelector) return node;
    return document;
  }

  function transparencyInput(scope) {
    return scope.querySelector("[data-tc-transparency]");
  }

  function oldTransparencyContainer(slider) {
    if (!slider) return null;

    return slider.closest(
      ".tc-transparency-row, [data-tc-transparency-row], [data-tc-field], .tc-field, .field, .form-row, .tc-form-row, label, .control, .setting"
    ) || slider.parentElement;
  }

  function shouldHideOldContainer(container) {
    if (!container) return false;

    // Never hide large structural panels.
    if (
      container.matches(".tc-editor, .theme-creator-editor, .tc-panel, .tc-controls, .tc-sidebar, .tc-modal, [data-theme-creator]")
    ) {
      return false;
    }

    // Never hide containers that hold unrelated controls.
    if (container.querySelector("[data-tc-color], button, textarea")) {
      return false;
    }

    return true;
  }

  function ensurePanel(root = document) {
    const scope = scopeFor(root);
    const slider = transparencyInput(scope);
    if (!slider) return false;

    const row = slider.closest(".tc-transparency-row, [data-tc-transparency-row]");
    if (row) {
      row.classList.remove("tc-transparency-hidden-v160");
      row.querySelectorAll(".tc-transparency-hidden-v160").forEach((el) => {
        el.classList.remove("tc-transparency-hidden-v160");
      });
    }

    return false;
  }

  function schedule(root = document) {
    requestAnimationFrame(() => ensurePanel(root));
    setTimeout(() => ensurePanel(root), 100);
    setTimeout(() => ensurePanel(root), 350);
  }

  document.addEventListener("click", () => schedule(document), true);
  document.addEventListener("input", (event) => {
    if (event.target && event.target.matches("[data-tc-transparency], [data-tc-transparency-number]")) {
      ensurePanel(scopeFor(event.target));
    }
  }, true);

  window.themeCreatorV160EnsureTransparencyPanel = ensurePanel;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => schedule(document), { once: true });
  } else {
    schedule(document);
  }
})();
/* Theme Creator v160 explicit transparency panel end */

/* Theme Creator v161 transparency header begin */
(function themeCreatorTransparencyHeaderV161() {
  function scopeFor(node) {
    if (node && node.closest) {
      return node.closest(".tc-modal") || node.closest("[data-theme-creator]") || document;
    }
    if (node && node.querySelector) return node;
    return document;
  }

  function ensureHeader(root = document) {
    const scope = scopeFor(root);

    if (typeof window.themeCreatorV160EnsureTransparencyPanel === "function") {
      try {
        window.themeCreatorV160EnsureTransparencyPanel(scope);
      } catch (_) {}
    }

    const panel = scope.querySelector("[data-tc-transparency-panel-v160], .tc-transparency-panel-v160");
    const slider = panel && panel.querySelector("[data-tc-transparency]");
    if (!panel || !slider) return false;

    let heading = panel.querySelector("[data-tc-transparency-heading-v161]");
    if (!heading) {
      heading = document.createElement("div");
      heading.className = "tc-transparency-heading-v161 tc-colour-heading-v146";
      heading.setAttribute("data-tc-transparency-heading-v161", "true");
      heading.textContent = "Transparency";
      panel.insertBefore(heading, slider);
    }

    heading.textContent = "Transparency";
    panel.classList.add("tc-transparency-panel-with-heading-v161");
    slider.classList.add("tc-transparency-slider-with-heading-v161");

    return true;
  }

  function schedule(root = document) {
    requestAnimationFrame(() => ensureHeader(root));
    setTimeout(() => ensureHeader(root), 120);
    setTimeout(() => ensureHeader(root), 400);
  }

  document.addEventListener("click", () => schedule(document), true);

  document.addEventListener("input", (event) => {
    if (event.target && event.target.matches("[data-tc-transparency], [data-tc-transparency-number]")) {
      ensureHeader(scopeFor(event.target));
    }
  }, true);

  window.themeCreatorV161EnsureTransparencyHeader = ensureHeader;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => schedule(document), { once: true });
  } else {
    schedule(document);
  }
})();
/* Theme Creator v161 transparency header end */

/* Theme Creator v163 force taller colour selector begin */
(function themeCreatorForceTallerColourSelectorV163() {
  function scopeFor(node) {
    if (node && node.closest) {
      return node.closest(".tc-modal") || node.closest("[data-theme-creator]") || document;
    }
    if (node && node.querySelector) return node;
    return document;
  }

  function colourShell(scope) {
    return (
      scope.querySelector("[data-tc-colour-editor-shell-v152]") ||
      scope.querySelector(".tc-colour-editor-shell-v152") ||
      scope.querySelector("[data-tc-colour-editor-v146]")?.parentElement ||
      scope.querySelector(".tc-colour-editor-v146")?.parentElement
    );
  }

  function resize(root = document) {
    const scope = scopeFor(root);

    if (typeof window.themeCreatorEnsureSingleColourViewport === "function") {
      try {
        window.themeCreatorEnsureSingleColourViewport(scope);
      } catch (_) {}
    }

    const shell = colourShell(scope);
    if (!shell) return false;

    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 900;
    const shellTop = Math.max(0, shell.getBoundingClientRect().top || 0);

    /*
      Make the colour selector materially taller than before.
      Leave room below for Transparency + action buttons, but allow the left
      editor column to scroll if needed.
    */
    let desired = Math.round(viewportHeight * 0.62);

    if (viewportHeight >= 1000) {
      desired = Math.round(viewportHeight * 0.66);
    } else if (viewportHeight < 820) {
      desired = Math.round(viewportHeight * 0.54);
    }

    const availableFromTop = Math.round(viewportHeight - shellTop - 185);
    if (availableFromTop > desired) {
      desired = availableFromTop;
    }

    desired = Math.max(430, Math.min(desired, 760));

    shell.classList.add("tc-colour-selector-tall-v163");
    shell.style.setProperty("--tc-colour-selector-height-v163", `${desired}px`);
    shell.style.setProperty("height", `${desired}px`, "important");
    shell.style.setProperty("max-height", `${desired}px`, "important");
    shell.style.setProperty("min-height", `${Math.min(desired, 430)}px`, "important");
    shell.style.setProperty("overflow-y", "auto", "important");
    shell.style.setProperty("overflow-x", "hidden", "important");

    const column = shell.closest(".tc-editor, .theme-creator-editor, .tc-controls, .tc-sidebar, .tc-panel");
    if (column) {
      column.classList.add("tc-colour-column-tall-v163");
      column.style.setProperty("max-height", "calc(100vh - 5.5rem)", "important");
      column.style.setProperty("overflow-y", "auto", "important");
      column.style.setProperty("overflow-x", "hidden", "important");
      column.style.setProperty("min-height", "0", "important");
    }

    return {
      height: desired,
      shellClientHeight: shell.clientHeight,
      shellScrollHeight: shell.scrollHeight,
    };
  }

  function schedule(root = document) {
    requestAnimationFrame(() => resize(root));
    setTimeout(() => resize(root), 120);
    setTimeout(() => resize(root), 400);
  }

  window.addEventListener("resize", () => schedule(document), { passive: true });

  document.addEventListener("click", () => schedule(document), true);

  window.themeCreatorV163ResizeColourSelector = resize;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => schedule(document), { once: true });
  } else {
    schedule(document);
  }
})();
/* Theme Creator v163 force taller colour selector end */

/* Theme Creator v166 missing tab controls begin */
(function themeCreatorMissingTabControlsV166() {
  const EXTRA_TABS = [
    ["tabIndicator", "Tab Indicator", "#89b4fa"],
    ["tabModified", "Modified Tab", "#f9e2af"],
    ["tabClose", "Close Button", "#a6adc8"],
  ];

  function scopeFor(node) {
    if (node && node.closest) {
      return node.closest(".tc-modal") || node.closest("[data-theme-creator]") || document;
    }
    if (node && node.querySelector) return node;
    return document;
  }

  function validHex(value) {
    return /^#[0-9a-fA-F]{6}$/.test(String(value || "").trim());
  }

  function existingValue(scope, key, fallback) {
    const existing =
      scope.querySelector(`[data-v146-generated][data-tc-color="${key}"]`) ||
      scope.querySelector(`[data-tc-color="${key}"]`);
    return existing && validHex(existing.value) ? existing.value : fallback;
  }

  function tabsSection(scope) {
    const sections = [...scope.querySelectorAll(".tc-colour-section-v146")];
    return sections.find((section) => {
      const heading = section.querySelector(".tc-colour-heading-v146");
      return heading && /tabs/i.test(heading.textContent || "");
    });
  }

  function makeCard(scope, key, label, fallback) {
    const value = existingValue(scope, key, fallback);

    const card = document.createElement("label");
    card.className = "tc-colour-card-v146 tc-tab-extra-card-v166";
    card.setAttribute("data-tc-tab-extra-card-v166", key);

    const title = document.createElement("span");
    title.className = "tc-colour-label-v146";
    title.textContent = label;

    const hex = document.createElement("span");
    hex.className = "tc-colour-hex-v146";
    hex.textContent = value.toUpperCase();

    const input = document.createElement("input");
    input.type = "color";
    input.value = value;
    input.setAttribute("data-tc-color", key);
    input.setAttribute("data-v166-generated", "true");
    input.setAttribute("aria-label", label);
    input.title = label;

    input.addEventListener("input", () => {
      hex.textContent = input.value.toUpperCase();
      if (typeof updatePreview === "function") {
        try { updatePreview(scope); } catch (_) {}
      }
    });

    input.addEventListener("change", () => {
      hex.textContent = input.value.toUpperCase();
    });

    card.appendChild(title);
    card.appendChild(hex);
    card.appendChild(input);

    return card;
  }

  function ensure(root = document) {
    const scope = scopeFor(root);

    if (typeof window.themeCreatorRenderProfessionalColourEditor === "function") {
      try { window.themeCreatorRenderProfessionalColourEditor(scope); } catch (_) {}
    }

    const section = tabsSection(scope);
    if (!section) return false;

    EXTRA_TABS.forEach(([key, label, fallback]) => {
      if (section.querySelector(`[data-tc-color="${key}"]`)) return;
      section.appendChild(makeCard(scope, key, label, fallback));
    });

    return true;
  }

  function schedule(root = document) {
    requestAnimationFrame(() => ensure(root));
    setTimeout(() => ensure(root), 150);
    setTimeout(() => ensure(root), 500);
  }

  document.addEventListener("click", () => schedule(document), true);

  window.themeCreatorV166EnsureTabControls = ensure;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => schedule(document), { once: true });
  } else {
    schedule(document);
  }
})();
/* Theme Creator v166 missing tab controls end */





/* Theme Creator v173 existing preview refinements begin */
(function themeCreatorExistingPreviewRefinementsV173() {
  function scopeFor(node) {
    if (node && node.closest) {
      return node.closest(".tc-modal") || node.closest("[data-theme-creator]") || document;
    }
    if (node && node.querySelector) return node;
    return document;
  }

  function validHex(value) {
    return /^#[0-9a-fA-F]{6}$/.test(String(value || "").trim());
  }

  function colour(scope, keys, fallback) {
    const list = Array.isArray(keys) ? keys : [keys];

    for (const key of list) {
      const generated = scope.querySelector(`[data-v146-generated][data-tc-color="${key}"]`);
      const normal = scope.querySelector(`[data-tc-color="${key}"]`);
      const original = scope.querySelector(`[data-tc-color-original-v146="${key}"]`);

      const value =
        (generated && generated.value) ||
        (normal && normal.value) ||
        (original && original.value);

      if (validHex(value)) return value;
    }

    return fallback;
  }

  function palette(scope) {
    const fg = colour(scope, "fg", "#cdd6f4");
    const fgAlt = colour(scope, "fgAlt", "#a6adc8");
    const bgAlt = colour(scope, "bgAlt", "#181825");
    const hlLine = colour(scope, "hlLine", "#252535");

    return {
      fg,
      fgAlt,
      bgAlt,
      hlLine,
      comments: colour(scope, ["comments", "comment"], "#6c7086"),
      tabClose: colour(scope, ["tabClose", "tabCloseFg", "fgAlt"], fgAlt),
      lineNumberBg: colour(scope, ["lineNumberBg", "bgAlt"], bgAlt),
      lineNumberFg: colour(scope, ["lineNumberFg", "fgAlt"], fgAlt),
      currentLineNumberBg: colour(scope, ["currentLineNumberBg", "hlLine"], hlLine),
      currentLineNumberFg: colour(scope, ["currentLineNumberFg", "hlLineFg", "fg"], fg),
    };
  }

  function textOf(node) {
    return String(node && node.textContent || "").trim();
  }

  function isNumberText(node) {
    return /^[0-9]{1,4}$/.test(textOf(node));
  }

  function previewArea(scope) {
    return scope.querySelector("[data-tc-preview-area], .tc-preview, .theme-creator-preview");
  }

  function addTabCloseButtons(scope) {
    scope.querySelectorAll("[data-tc-preview-tab]").forEach((tab) => {
      if (tab.querySelector("[data-tc-preview-tab-close-v173]")) return;

      const close = document.createElement("span");
      close.className = "tc-preview-tab-close-v173";
      close.setAttribute("data-tc-preview-tab-close-v173", "true");
      close.setAttribute("aria-hidden", "true");
      close.textContent = "×";

      tab.appendChild(close);
      tab.classList.add("tc-preview-tab-with-close-v173");
    });
  }

  function likelyLineNumberNodes(area) {
    const found = new Set();

    const selector = [
      "[data-tc-line-number]",
      "[data-line-number]",
      ".tc-line-number",
      ".tc-preview-line-number",
      ".tc-lineno",
      ".tc-line-no",
      ".tc-ln",
      ".line-number",
      ".lineno",
      ".line-no",
      ".gutter-line",
      ".gutter-number"
    ].join(",");

    area.querySelectorAll(selector).forEach((node) => {
      if (isNumberText(node)) found.add(node);
    });

    // Generic fallback: existing preview rows usually have the line number as
    // the first child and the code as the second child.
    area.querySelectorAll("div, li, tr").forEach((row) => {
      const children = [...row.children];
      if (children.length < 2) return;

      const first = children[0];
      const second = children[1];

      if (!isNumberText(first)) return;
      if (!second || textOf(second).length < 1) return;
      if (first.closest("[data-tc-preview-tab], .tc-preview-tabs")) return;

      found.add(first);
    });

    return [...found];
  }

  function isCurrentLineNumber(node) {
    if (
      node.matches("[aria-current='line'], [data-current-line], [data-tc-current-line], .is-current, .current, .active, .current-line, .line-current") ||
      node.closest("[aria-current='line'], [data-current-line], [data-tc-current-line], .is-current, .current-line, .line-current")
    ) {
      return true;
    }

    return false;
  }

  function themeLineNumbers(scope, p) {
    const area = previewArea(scope);
    if (!area) return { numbers: 0 };

    area.style.setProperty("--tc-v173-line-number-bg", p.lineNumberBg);
    area.style.setProperty("--tc-v173-line-number-fg", p.lineNumberFg);
    area.style.setProperty("--tc-v173-current-line-number-bg", p.currentLineNumberBg);
    area.style.setProperty("--tc-v173-current-line-number-fg", p.currentLineNumberFg);
    area.style.setProperty("--tc-v173-org-block-bg", p.bgAlt);
    area.style.setProperty("--tc-v173-org-block-meta", p.comments);
    area.style.setProperty("--tc-v173-tab-close", p.tabClose);

    const numbers = likelyLineNumberNodes(area);

    numbers.forEach((node) => {
      node.classList.add("tc-v173-line-number");

      if (isCurrentLineNumber(node)) {
        node.classList.add("tc-v173-line-number-current");
      } else {
        node.classList.remove("tc-v173-line-number-current");
      }
    });

    // If the preview has real gutter containers, theme them too.
    area.querySelectorAll(
      "[data-tc-line-numbers], [data-line-numbers], .tc-line-numbers, .tc-window-line-numbers, .tc-preview-line-numbers, .line-numbers, .gutter, .line-gutter, .editor-gutter"
    ).forEach((gutter) => {
      gutter.classList.add("tc-v173-line-number-gutter");
    });

    return { numbers: numbers.length };
  }

  function installOrgDoomBlocks() {
    if (typeof CONTENTS !== "object" || !CONTENTS) return;

    CONTENTS.org = [
      "#+TITLE: Theme Preview User Interface",
      "#+AUTHOR: Doom User",
      "#+DESCRIPTION: Literate Doom Emacs UI configuration used by the Theme Creator preview.",
      "#+DATE: 2026-06-30 Tue",
      "#+PROPERTY: header-args :tangle ../config/theme-preview-ui.el",
      "#+auto_tangle: t",
      "#+FILETAGS: :ui:theme:preview:tabs:gutter:",
      "#+KEYWORDS: doom, theme, user interface, tabs, line numbers",
      "",
      "* Table of Contents :TOC:",
      "- [[#doom-emacs-interface][Doom Emacs Interface]]",
      "  - [[#fonts-and-theme][Fonts and Theme]]",
      "  - [[#line-numbers-and-gutter][Line Numbers and Gutter]]",
      "  - [[#org-source-blocks][Org Source Blocks]]",
      "- [[#centaur-tabs][Centaur Tabs]]",
      "- [[#modified-window][Modified Window]]",
      "- [[#module-footer][Module Footer]]",
      "",
      "* Doom Emacs Interface",
      "",
      "This section defines the visual foundation for the preview. It keeps the",
      "theme, typography, line numbers, and Org block styling together so the",
      "configuration reads like a small literate UI module.",
      "",
      "** Fonts and Theme",
      "",
      "Font and theme defaults are set early so the rest of the interface can",
      "inherit a consistent look.",
      "",
      "#+begin_src emacs-lisp",
      ";;; theme-preview-ui.el --- Theme Creator preview UI -*- lexical-binding: t; -*-",
      "",
      "(setq doom-theme 'doom-one",
      "      doom-font (font-spec :family \"JetBrains Mono\" :size 13)",
      "      doom-variable-pitch-font (font-spec :family \"Inter\" :size 16)",
      "      display-line-numbers-type 'relative)",
      "",
      "(use-package! doom-themes",
      "  :config",
      "  (setq doom-themes-enable-bold t",
      "        doom-themes-enable-italic t))",
      "#+end_src",
      "",
      "** Line Numbers and Gutter",
      "",
      "Line numbers should be visible without competing with the buffer text. The",
      "current line receives a stronger face so it remains easy to find.",
      "",
      "#+begin_src emacs-lisp",
      "(after! doom-themes",
      "  (custom-set-faces!",
      "   `(line-number",
      "     :inherit default",
      "     :height 0.95",
      "     :foreground ,(or (doom-color 'base6) \"#8b90a3\"))",
      "   `(line-number-current-line",
      "     :inherit default",
      "     :weight bold",
      "     :foreground ,(or (doom-color 'fg) \"#ffffff\"))",
      "   `(fringe",
      "     :background ,(or (doom-color 'bg-alt) \"#181825\"))))",
      "#+end_src",
      "",
      "** Org Source Blocks",
      "",
      "Org source blocks should show their language clearly, use the alternate",
      "background, and preserve normal Emacs Lisp syntax highlighting.",
      "",
      "#+begin_src emacs-lisp",
      "(after! org",
      "  (setq org-fontify-whole-heading-line t",
      "        org-hide-emphasis-markers t",
      "        org-pretty-entities t",
      "        org-src-fontify-natively t",
      "        org-src-tab-acts-natively t))",
      "#+end_src",
      "",
      "* Centaur Tabs",
      "",
      "Tabs provide a visible buffer list. The close button and active bar are",
      "enabled so the preview can exercise the tab colours.",
      "",
      "#+begin_src emacs-lisp",
      "(when (modulep! :ui tabs)",
      "  (after! centaur-tabs",
      "    (setq centaur-tabs-style \"bar\"",
      "          centaur-tabs-height 28",
      "          centaur-tabs-set-icons t",
      "          centaur-tabs-set-bar 'over",
      "          centaur-tabs-show-navigation-buttons t",
      "          centaur-tabs-set-modified-marker t",
      "          centaur-tabs-close-button \"✕\"",
      "          centaur-tabs-cycle-scope 'tabs)",
      "    (centaur-tabs-mode +1)))",
      "#+end_src",
      "",
      "* Modified Window",
      "",
      "The modified window should match the original Org file, with only the",
      "changed values standing out in the second preview pane.",
      "",
      "#+begin_src emacs-lisp",
      "(after! centaur-tabs",
      "  (setq centaur-tabs-modified-marker \"●\"",
      "        centaur-tabs-set-modified-marker t)",
      "",
      "  (custom-set-faces!",
      "   '(centaur-tabs-selected-modified :weight bold)",
      "   '(centaur-tabs-unselected-modified :slant italic)))",
      "#+end_src",
      "",
      "* Module Footer",
      "",
      "The final expression makes it obvious that the tangled module loaded.",
      "",
      "#+begin_src emacs-lisp",
      "(message \"Theme preview UI loaded\")",
      "(provide 'theme-preview-ui)",
      "#+end_src"
    ];
  }

  function patchOrgHighlighting() {
    if (typeof highlightOrgLine !== "function") return;
    if (highlightOrgLine.themeCreatorV173Patched) return;

    const oldHighlightOrgLine = highlightOrgLine;

    highlightOrgLine = function themeCreatorV173HighlightOrgLine(line) {
      const raw = String(line || "");

      if (/^\s*#\+begin_src\s+emacs-lisp\b/i.test(raw) || /^\s*#\+end_src\b/i.test(raw)) {
        return `<span class="tc-v173-org-src-delim">${escapeHtml(raw)}</span>`;
      }

      if (/^\s*\((doom!|setq|after!|package!|map!|use-package!|defun|add-to-list)\b/.test(raw)) {
        return `<span class="tc-v173-org-src-code">${highlightStringAware(raw, "elisp")}</span>`;
      }

      return oldHighlightOrgLine(raw);
    };

    highlightOrgLine.themeCreatorV173Patched = true;
  }

  function apply(root = document) {
    const scope = scopeFor(root);
    const p = palette(scope);

    installOrgDoomBlocks();
    patchOrgHighlighting();
    addTabCloseButtons(scope);

    const lineResult = themeLineNumbers(scope, p);

    window.themeCreatorV173LastPreviewRefinement = {
      closeButtons: scope.querySelectorAll("[data-tc-preview-tab-close-v173]").length,
      lineNumbers: lineResult.numbers,
      palette: p,
    };

    return window.themeCreatorV173LastPreviewRefinement;
  }

  function schedule(root = document) {
    requestAnimationFrame(() => apply(root));
    setTimeout(() => apply(root), 120);
    setTimeout(() => apply(root), 400);
  }

  if (typeof updatePreview === "function" && !updatePreview.themeCreatorV173Wrapped) {
    const previousUpdatePreview = updatePreview;

    updatePreview = function themeCreatorV173UpdatePreview(root) {
      installOrgDoomBlocks();
      patchOrgHighlighting();

      const result = previousUpdatePreview(root);
      schedule(root || document);

      return result;
    };

    updatePreview.themeCreatorV173Wrapped = true;
  }

  document.addEventListener("input", (event) => {
    if (event.target && event.target.matches("[data-tc-color], [data-tc-transparency]")) {
      schedule(scopeFor(event.target));
    }
  }, true);

  document.addEventListener("change", (event) => {
    if (event.target && event.target.matches("[data-tc-color], [data-tc-transparency]")) {
      schedule(scopeFor(event.target));
    }
  }, true);

  document.addEventListener("click", () => schedule(document), true);

  window.themeCreatorV173RefineExistingPreview = apply;

  installOrgDoomBlocks();
  patchOrgHighlighting();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => schedule(document), { once: true });
  } else {
    schedule(document);
  }
})();
/* Theme Creator v173 existing preview refinements end */








/* Theme Creator v183 Org modified match and bgAlt sync begin */
(function themeCreatorOrgModifiedMatchAndBgAltSyncV183() {
  const MAIN_ORG_SAMPLE_V183 = [
    "#+TITLE: Theme Preview User Interface",
    "#+AUTHOR: Doom User",
    "#+DESCRIPTION: Literate Doom Emacs UI configuration used by the Theme Creator preview.",
    "#+DATE: 2026-06-30 Tue",
    "#+PROPERTY: header-args :tangle ../config/theme-preview-ui.el",
    "#+auto_tangle: t",
    "#+FILETAGS: :ui:theme:preview:tabs:gutter:",
    "#+KEYWORDS: doom, theme, user interface, tabs, line numbers",
    "",
    "* Table of Contents :TOC:",
    "- [[#doom-emacs-interface][Doom Emacs Interface]]",
    "  - [[#fonts-and-theme][Fonts and Theme]]",
    "  - [[#line-numbers-and-gutter][Line Numbers and Gutter]]",
    "  - [[#org-source-blocks][Org Source Blocks]]",
    "- [[#centaur-tabs][Centaur Tabs]]",
    "- [[#modified-window][Modified Window]]",
    "- [[#module-footer][Module Footer]]",
    "",
    "* Doom Emacs Interface",
    "",
    "This section defines the visual foundation for the preview. It keeps the",
    "theme, typography, line numbers, and Org block styling together so the",
    "configuration reads like a small literate UI module.",
    "",
    "** Fonts and Theme",
    "",
    "Font and theme defaults are set early so the rest of the interface can",
    "inherit a consistent look.",
    "",
    "#+begin_src emacs-lisp",
    ";;; theme-preview-ui.el --- Theme Creator preview UI -*- lexical-binding: t; -*-",
    "",
    "(setq doom-theme 'doom-one",
    "      doom-font (font-spec :family \"JetBrains Mono\" :size 13)",
    "      doom-variable-pitch-font (font-spec :family \"Inter\" :size 16)",
    "      display-line-numbers-type 'relative)",
    "",
    "(use-package! doom-themes",
    "  :config",
    "  (setq doom-themes-enable-bold t",
    "        doom-themes-enable-italic t))",
    "#+end_src",
    "",
    "** Line Numbers and Gutter",
    "",
    "Line numbers should be visible without competing with the buffer text. The",
    "current line receives a stronger face so it remains easy to find.",
    "",
    "#+begin_src emacs-lisp",
    "(after! doom-themes",
    "  (custom-set-faces!",
    "   `(line-number",
    "     :inherit default",
    "     :height 0.95",
    "     :foreground ,(or (doom-color 'base6) \"#8b90a3\"))",
    "   `(line-number-current-line",
    "     :inherit default",
    "     :weight bold",
    "     :foreground ,(or (doom-color 'fg) \"#ffffff\"))",
    "   `(fringe",
    "     :background ,(or (doom-color 'bg-alt) \"#181825\"))))",
    "#+end_src",
    "",
    "** Org Source Blocks",
    "",
    "Org source blocks should show their language clearly, use the alternate",
    "background, and preserve normal Emacs Lisp syntax highlighting.",
    "",
    "#+begin_src emacs-lisp",
    "(after! org",
    "  (setq org-fontify-whole-heading-line t",
    "        org-hide-emphasis-markers t",
    "        org-pretty-entities t",
    "        org-src-fontify-natively t",
    "        org-src-tab-acts-natively t))",
    "#+end_src",
    "",
    "* Centaur Tabs",
    "",
    "Tabs provide a visible buffer list. The close button and active bar are",
    "enabled so the preview can exercise the tab colours.",
    "",
    "#+begin_src emacs-lisp",
    "(when (modulep! :ui tabs)",
    "  (after! centaur-tabs",
    "    (setq centaur-tabs-style \"bar\"",
    "          centaur-tabs-height 28",
    "          centaur-tabs-set-icons t",
    "          centaur-tabs-set-bar 'over",
    "          centaur-tabs-show-navigation-buttons t",
    "          centaur-tabs-set-modified-marker t",
    "          centaur-tabs-close-button \"✕\"",
    "          centaur-tabs-cycle-scope 'tabs)",
    "    (centaur-tabs-mode +1)))",
    "#+end_src",
    "",
    "* Modified Window",
    "",
    "The modified window should match the original Org file, with only the",
    "changed values standing out in the second preview pane.",
    "",
    "#+begin_src emacs-lisp",
    "(after! centaur-tabs",
    "  (setq centaur-tabs-modified-marker \"●\"",
    "        centaur-tabs-set-modified-marker t)",
    "",
    "  (custom-set-faces!",
    "   '(centaur-tabs-selected-modified :weight bold)",
    "   '(centaur-tabs-unselected-modified :slant italic)))",
    "#+end_src",
    "",
    "* Module Footer",
    "",
    "The final expression makes it obvious that the tangled module loaded.",
    "",
    "#+begin_src emacs-lisp",
    "(message \"Theme preview UI loaded\")",
    "(provide 'theme-preview-ui)",
    "#+end_src"
];
  const MODIFIED_ORG_SAMPLE_V183 = [
    "#+TITLE: Theme Preview User Interface",
    "#+AUTHOR: Doom User",
    "#+DESCRIPTION: Literate Doom Emacs UI configuration used by the Theme Creator preview.",
    "#+DATE: 2026-06-30 Tue",
    "#+PROPERTY: header-args :tangle ../config/theme-preview-ui.el",
    "#+auto_tangle: t",
    "#+FILETAGS: :ui:theme:preview:tabs:gutter:",
    "#+KEYWORDS: doom, theme, user interface, tabs, line numbers",
    "",
    "* Table of Contents :TOC:",
    "- [[#doom-emacs-interface][Doom Emacs Interface]]",
    "  - [[#fonts-and-theme][Fonts and Theme]]",
    "  - [[#line-numbers-and-gutter][Line Numbers and Gutter]]",
    "  - [[#org-source-blocks][Org Source Blocks]]",
    "- [[#centaur-tabs][Centaur Tabs]]",
    "- [[#modified-window][Modified Window]]",
    "- [[#module-footer][Module Footer]]",
    "",
    "* Doom Emacs Interface",
    "",
    "This section defines the visual foundation for the preview. It keeps the",
    "theme, typography, line numbers, and Org block styling together so the",
    "configuration reads like a small literate UI module.",
    "",
    "** Fonts and Theme",
    "",
    "Font and theme defaults are set early so the rest of the interface can",
    "inherit a consistent look.",
    "",
    "#+begin_src emacs-lisp",
    ";;; theme-preview-ui.el --- Theme Creator preview UI -*- lexical-binding: t; -*-",
    "",
    "(setq doom-theme 'doom-moonlight",
    "      doom-font (font-spec :family \"JetBrains Mono\" :size 14)",
    "      doom-variable-pitch-font (font-spec :family \"Inter\" :size 16)",
    "      display-line-numbers-type t)",
    "",
    "(use-package! doom-themes",
    "  :config",
    "  (setq doom-themes-enable-bold t",
    "        doom-themes-enable-italic t))",
    "#+end_src",
    "",
    "** Line Numbers and Gutter",
    "",
    "Line numbers should be visible without competing with the buffer text. The",
    "current line receives a stronger face so it remains easy to find.",
    "",
    "#+begin_src emacs-lisp",
    "(after! doom-themes",
    "  (custom-set-faces!",
    "   `(line-number",
    "     :inherit default",
    "     :height 0.95",
    "     :foreground ,(or (doom-color 'base6) \"#8b90a3\"))",
    "   `(line-number-current-line",
    "     :inherit default",
    "     :weight bold",
    "     :foreground ,(or (doom-color 'fg) \"#ffffff\"))",
    "   `(fringe",
    "     :background ,(or (doom-color 'bg-alt) \"#181825\"))))",
    "#+end_src",
    "",
    "** Org Source Blocks",
    "",
    "Org source blocks should show their language clearly, use the alternate",
    "background, and preserve normal Emacs Lisp syntax highlighting.",
    "",
    "#+begin_src emacs-lisp",
    "(after! org",
    "  (setq org-fontify-whole-heading-line t",
    "        org-hide-emphasis-markers t",
    "        org-pretty-entities t",
    "        org-src-fontify-natively t",
    "        org-src-tab-acts-natively t))",
    "#+end_src",
    "",
    "* Centaur Tabs",
    "",
    "Tabs provide a visible buffer list. The close button and active bar are",
    "enabled so the preview can exercise the tab colours.",
    "",
    "#+begin_src emacs-lisp",
    "(when (modulep! :ui tabs)",
    "  (after! centaur-tabs",
    "    (setq centaur-tabs-style \"bar\"",
    "          centaur-tabs-height 30",
    "          centaur-tabs-set-icons t",
    "          centaur-tabs-set-bar 'left",
    "          centaur-tabs-show-navigation-buttons t",
    "          centaur-tabs-set-modified-marker t",
    "          centaur-tabs-close-button \"✕\"",
    "          centaur-tabs-cycle-scope 'tabs)",
    "    (centaur-tabs-mode +1)))",
    "#+end_src",
    "",
    "* Modified Window",
    "",
    "The modified window mirrors the original file, with only the",
    "changed values standing out in the second preview pane.",
    "",
    "#+begin_src emacs-lisp",
    "(after! centaur-tabs",
    "  (setq centaur-tabs-modified-marker \"●\"",
    "        centaur-tabs-set-modified-marker t)",
    "",
    "  (custom-set-faces!",
    "   '(centaur-tabs-selected-modified :weight bold)",
    "   '(centaur-tabs-unselected-modified :slant italic)))",
    "#+end_src",
    "",
    "* Module Footer",
    "",
    "The final expression makes it obvious that the tangled module loaded.",
    "",
    "#+begin_src emacs-lisp",
    "(message \"Theme preview UI loaded\")",
    "(provide 'theme-preview-ui)",
    "#+end_src"
];

  function esc(value) {
    if (typeof escapeHtml === "function") return escapeHtml(String(value || ""));
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function validHex(value) {
    return /^#[0-9a-fA-F]{6}$/.test(String(value || "").trim());
  }

  function colour(scope, keys, fallback) {
    const list = Array.isArray(keys) ? keys : [keys];

    for (const key of list) {
      const generated = scope.querySelector(`[data-v146-generated][data-tc-color="${key}"]`);
      const normal = scope.querySelector(`[data-tc-color="${key}"]`);
      const original = scope.querySelector(`[data-tc-color-original-v146="${key}"]`);
      const value =
        (generated && generated.value) ||
        (normal && normal.value) ||
        (original && original.value);

      if (validHex(value)) return value;
    }

    return fallback;
  }

  function palette(scope) {
    const fg = colour(scope, "fg", "#cdd6f4");
    const bg = colour(scope, "bg", "#11111b");
    const bgAlt = colour(scope, "bgAlt", "#181825");
    const fgAlt = colour(scope, "fgAlt", "#a6adc8");
    const accent = colour(scope, "accent", "#89b4fa");

    return {
      fg,
      bg,
      bgAlt,
      fgAlt,
      accent,
      comments: colour(scope, ["comments", "comment"], "#6c7086"),
      keywords: colour(scope, "keywords", "#cba6f7"),
      functions: colour(scope, "functions", "#89b4fa"),
      variables: colour(scope, "variables", "#f38ba8"),
      strings: colour(scope, "strings", "#a6e3a1"),
      hlLine: colour(scope, "hlLine", "#252535"),
      tabModified: colour(scope, ["tabModified", "accent"], accent),
    };
  }

  function applyPaletteVars(area, p) {
    area.style.setProperty("--tc-v183-bg", p.bg);
    area.style.setProperty("--tc-v183-fg", p.fg);
    area.style.setProperty("--tc-v183-bg-alt", p.bgAlt);
    area.style.setProperty("--tc-v183-fg-alt", p.fgAlt);
    area.style.setProperty("--tc-v183-accent", p.accent);
    area.style.setProperty("--tc-v183-comment", p.comments);
    area.style.setProperty("--tc-v183-keyword", p.keywords);
    area.style.setProperty("--tc-v183-function", p.functions);
    area.style.setProperty("--tc-v183-variable", p.variables);
    area.style.setProperty("--tc-v183-string", p.strings);
    area.style.setProperty("--tc-v183-hl-line", p.hlLine);
    area.style.setProperty("--tc-v183-tab-modified", p.tabModified);
  }

  function setImportant(node, property, value) {
    try { node.style.setProperty(property, value, "important"); } catch (_) {}
  }

  function highlightElisp(value) {
    if (typeof highlightStringAware === "function") {
      try { return highlightStringAware(String(value || ""), "elisp"); } catch (_) {}
    }
    return esc(value);
  }

  function renderOrgLine(raw, state) {
    const line = String(raw || "");

    if (/^\s*#\+begin_src\s+emacs-lisp\b/i.test(line)) {
      state.inSrc = true;
      return {
        kind: "src-begin",
        html: `<span class="tc-v183-org-src-delim">${esc(line)}</span>`
      };
    }

    if (/^\s*#\+end_src\b/i.test(line)) {
      state.inSrc = false;
      return {
        kind: "src-end",
        html: `<span class="tc-v183-org-src-delim">${esc(line)}</span>`
      };
    }

    if (state.inSrc) {
      return {
        kind: "src-code",
        html: `<span class="tc-v183-org-src-code">${highlightElisp(line)}</span>`
      };
    }

    const property = line.match(/^(\s*#\+[A-Za-z0-9_:-]+:)(.*)$/);
    if (property) {
      const isTitle = /^#\+TITLE:/i.test(property[1].trim());
      return {
        kind: isTitle ? "file-title" : "property",
        html: `<span class="tc-v183-org-property-key">${esc(property[1])}</span><span class="tc-v183-org-property-value">${esc(property[2] || "")}</span>`
      };
    }

    const heading = line.match(/^(\*+)\s+(.*)$/);
    if (heading) {
      const level = Math.min(4, heading[1].length);
      return {
        kind: `heading-${level}`,
        html: `<span class="tc-v183-org-stars">${esc(heading[1])}</span> <span class="tc-v183-org-heading tc-v183-org-heading-${level}">${esc(heading[2])}</span>`
      };
    }

    const toc = line.match(/^(\s*)([-+])\s+\[\[#([^\]]+)\]\[([^\]]+)\]\]\s*$/);
    if (toc) {
      return {
        kind: "toc",
        html: `${esc(toc[1])}<span class="tc-v183-org-bullet">${esc(toc[2])}</span> <a class="tc-v183-org-toc-link" href="#${esc(toc[3])}" tabindex="-1">${esc(toc[4])}</a>`
      };
    }

    if (/^\s*$/.test(line)) {
      return { kind: "blank", html: "&nbsp;" };
    }

    return {
      kind: "prose",
      html: `<span class="tc-v183-org-prose">${esc(line)}</span>`
    };
  }

  function scopeFor(node) {
    if (node && node.closest) {
      return node.closest(".tc-modal") || node.closest("[data-theme-creator]") || document;
    }
    if (node && node.querySelector) return node;
    return document;
  }

  function previewArea(scope) {
    return scope.querySelector("[data-tc-preview-area]") ||
           scope.querySelector(".tc-preview") ||
           scope.querySelector(".theme-creator-preview");
  }

  function orgTabIsActive(scope) {
    try {
      if (typeof activePreview !== "undefined" && activePreview === "org") return true;
    } catch (_) {}

    return !!(
      scope.querySelector('[data-tc-preview-tab="org"].is-active') ||
      scope.querySelector('[data-tc-preview-tab="org"][aria-selected="true"]')
    );
  }

  function codeNodes(area) {
    return [...area.querySelectorAll("code")]
      .filter((node) => !node.closest(".tc-preview-tabs, .tc-preview-top, [data-tc-preview-tab]"));
  }

  function rowFor(code) {
    return code.closest("[data-tc-preview-row], .tc-preview-line, .tc-code-line, .tc-line, div, li, tr") ||
           code.parentElement;
  }

  function groupCodeNodes(area) {
    const nodes = codeNodes(area);

    if (nodes.length < 4) return [nodes];

    const byX = new Map();

    nodes.forEach((node) => {
      const rect = node.getBoundingClientRect();
      const key = String(Math.round(rect.left / 40) * 40);
      if (!byX.has(key)) byX.set(key, []);
      byX.get(key).push(node);
    });

    const groups = [...byX.values()]
      .filter((group) => group.length >= 3)
      .sort((a, b) => a[0].getBoundingClientRect().left - b[0].getBoundingClientRect().left);

    return groups.length >= 2 ? groups : [nodes];
  }

  function clearRowClasses(row) {
    if (!row || !row.classList) return;
    [...row.classList].forEach((cls) => {
      if (/^tc-v18[0-3]-org-row/.test(cls)) row.classList.remove(cls);
    });
  }

  function changedLine(mainLine, modifiedLine) {
    return String(mainLine || "") !== String(modifiedLine || "");
  }

  function fillGroup(group, sample, compareSample, isModified) {
    const state = { inSrc: false };

    group.forEach((code, index) => {
      const raw = sample[index] || "";
      const rendered = renderOrgLine(raw, state);
      const row = rowFor(code);

      code.innerHTML = rendered.html || "&nbsp;";
      code.classList.add("tc-v183-org-code-cell");
      code.setAttribute("data-tc-v183-org-line", String(index + 1));
      code.setAttribute("data-tc-v183-org-kind", rendered.kind);

      clearRowClasses(row);
      if (row) {
        row.classList.add("tc-v183-org-row", `tc-v183-org-row-${rendered.kind}`);

        if (isModified) {
          row.classList.add("tc-v183-modified-window-row");
        }

        if (isModified && changedLine(compareSample[index], raw)) {
          row.classList.add("tc-v183-modified-changed-row");
        }
      }
    });
  }

  function installOrgSample() {
    if (typeof CONTENTS !== "object" || !CONTENTS) return false;
    CONTENTS.org = MAIN_ORG_SAMPLE_V183.slice();
    return true;
  }

  function styleOrgSourceBlocks(area, p) {
    area.querySelectorAll(".tc-v183-org-row-src-begin, .tc-v183-org-row-src-code, .tc-v183-org-row-src-end")
      .forEach((row) => {
        setImportant(row, "background-color", p.bgAlt);
      });

    area.querySelectorAll(".tc-v183-org-row-src-begin code, .tc-v183-org-row-src-code code, .tc-v183-org-row-src-end code")
      .forEach((code) => {
        setImportant(code, "background-color", p.bgAlt);
      });

    area.querySelectorAll(".tc-v183-org-src-code").forEach((node) => {
      setImportant(node, "background-color", p.bgAlt);
      setImportant(node, "color", p.fg);
      setImportant(node, "border-left-color", p.accent);
    });

    area.querySelectorAll(".tc-v183-org-src-delim").forEach((node) => {
      setImportant(node, "color", p.comments);
      setImportant(node, "background-color", p.bgAlt);
    });

    area.querySelectorAll(".tc-v183-org-src-code .tc-tok-comment").forEach((node) => setImportant(node, "color", p.comments));
    area.querySelectorAll(".tc-v183-org-src-code .tc-tok-keyword, .tc-v183-org-src-code .tc-tok-builtin").forEach((node) => setImportant(node, "color", p.keywords));
    area.querySelectorAll(".tc-v183-org-src-code .tc-tok-function").forEach((node) => setImportant(node, "color", p.functions));
    area.querySelectorAll(".tc-v183-org-src-code .tc-tok-variable, .tc-v183-org-src-code .tc-tok-constant").forEach((node) => setImportant(node, "color", p.variables));
    area.querySelectorAll(".tc-v183-org-src-code .tc-tok-string").forEach((node) => setImportant(node, "color", p.strings));
  }

  function markModifiedTabs(scope) {
    const orgTab =
      scope.querySelector('[data-tc-preview-tab="org"]') ||
      scope.querySelector(".tc-preview-tab.is-active");

    if (!orgTab || orgTab.querySelector("[data-tc-preview-tab-modified-v183]")) return;

    const marker = document.createElement("span");
    marker.className = "tc-preview-tab-modified-v183";
    marker.setAttribute("data-tc-preview-tab-modified-v183", "true");
    marker.setAttribute("aria-hidden", "true");
    marker.textContent = "●";
    orgTab.appendChild(marker);
  }

  function apply(root = document) {
    installOrgSample();

    const scope = scopeFor(root);
    const area = previewArea(scope);

    if (!area) {
      return { version: window.themeCreatorScriptVersion, activeOrg: false, reason: "no-preview-area" };
    }

    const p = palette(scope);
    applyPaletteVars(area, p);
    markModifiedTabs(scope);

    if (!orgTabIsActive(scope)) {
      return { version: window.themeCreatorScriptVersion, activeOrg: false, reason: "org-tab-not-active" };
    }

    area.classList.add("tc-v183-org-buffer-preview");

    const groups = groupCodeNodes(area);

    if (groups.length >= 2) {
      fillGroup(groups[0], MAIN_ORG_SAMPLE_V183, MODIFIED_ORG_SAMPLE_V183, false);
      fillGroup(groups[1], MODIFIED_ORG_SAMPLE_V183, MAIN_ORG_SAMPLE_V183, true);
    } else {
      fillGroup(groups[0], MAIN_ORG_SAMPLE_V183, MODIFIED_ORG_SAMPLE_V183, false);
    }

    styleOrgSourceBlocks(area, p);

    window.themeCreatorV183LastOrgPreview = {
      version: window.themeCreatorScriptVersion,
      activeOrg: true,
      groups: groups.length,
      codeRows: groups.reduce((n, group) => n + group.length, 0),
      tocLinks: area.querySelectorAll(".tc-v183-org-toc-link").length,
      modifiedRows: area.querySelectorAll(".tc-v183-modified-window-row").length,
      changedRows: area.querySelectorAll(".tc-v183-modified-changed-row").length,
      palette: p
    };

    return window.themeCreatorV183LastOrgPreview;
  }

  function schedule(root = document) {
    requestAnimationFrame(() => apply(root));
    setTimeout(() => apply(root), 80);
    setTimeout(() => apply(root), 220);
    setTimeout(() => apply(root), 650);
    setTimeout(() => apply(root), 1200);
  }

  if (typeof updatePreview === "function" && !updatePreview.themeCreatorV183Wrapped) {
    const previousUpdatePreview = updatePreview;

    updatePreview = function themeCreatorV183UpdatePreview(root) {
      installOrgSample();
      const result = previousUpdatePreview(root);
      schedule(root || document);
      return result;
    };

    updatePreview.themeCreatorV183Wrapped = true;
  }

  if (typeof setActivePreview === "function" && !setActivePreview.themeCreatorV183Wrapped) {
    const previousSetActivePreview = setActivePreview;

    setActivePreview = function themeCreatorV183SetActivePreview(root, kind) {
      installOrgSample();
      const result = previousSetActivePreview(root, kind);

      if (kind === "org") schedule(root || document);

      return result;
    };

    setActivePreview.themeCreatorV183Wrapped = true;
  }

  document.addEventListener("click", (event) => {
    if (
      event.target &&
      event.target.closest("[data-tc-preview-tab], [data-tc-preview-nav], [data-tc-preview]")
    ) {
      schedule(scopeFor(event.target));
    }
  }, true);

  document.addEventListener("input", (event) => {
    if (event.target && event.target.matches("[data-tc-color], [data-tc-transparency]")) {
      schedule(scopeFor(event.target));
    }
  }, true);

  document.addEventListener("change", (event) => {
    if (event.target && event.target.matches("[data-tc-color], [data-tc-transparency]")) {
      schedule(scopeFor(event.target));
    }
  }, true);

  installOrgSample();

  window.themeCreatorV183ApplyOrgPreview = apply;
})();
/* Theme Creator v183 Org modified match and bgAlt sync end */

/* Theme Creator v184 Doom match preview polish begin */
(function themeCreatorDoomMatchPreviewPolishV184() {
  function scopeFor(node) {
    if (node && node.closest) {
      return node.closest(".tc-modal") || node.closest("[data-theme-creator]") || document;
    }
    if (node && node.querySelector) return node;
    return document;
  }

  function validHex(value) {
    return /^#[0-9a-fA-F]{6}$/.test(String(value || "").trim());
  }

  function colour(scope, keys, fallback) {
    const list = Array.isArray(keys) ? keys : [keys];

    for (const key of list) {
      const generated = scope.querySelector(`[data-v146-generated][data-tc-color="${key}"]`);
      const normal = scope.querySelector(`[data-tc-color="${key}"]`);
      const original = scope.querySelector(`[data-tc-color-original-v146="${key}"]`);
      const value =
        (generated && generated.value) ||
        (normal && normal.value) ||
        (original && original.value);

      if (validHex(value)) return value;
    }

    return fallback;
  }

  function palette(scope) {
    const bg = colour(scope, "bg", "#11111b");
    const fg = colour(scope, "fg", "#cdd6f4");
    const bgAlt = colour(scope, "bgAlt", "#181825");
    const fgAlt = colour(scope, "fgAlt", "#a6adc8");
    const accent = colour(scope, "accent", "#89b4fa");
    const region = colour(scope, "region", "#313244");
    const hlLine = colour(scope, "hlLine", "#252535");

    return {
      bg,
      fg,
      bgAlt,
      fgAlt,
      accent,

      region,
      selectionFg: colour(scope, "selectionFg", fg),
      hlLine,
      hlLineFg: colour(scope, ["hlLineFg", "currentLineFg", "fg"], fg),

      comments: colour(scope, ["comments", "comment"], "#6c7086"),
      keywords: colour(scope, "keywords", "#cba6f7"),
      functions: colour(scope, "functions", "#89b4fa"),
      variables: colour(scope, "variables", "#f38ba8"),
      strings: colour(scope, "strings", "#a6e3a1"),

      modelineBg: colour(scope, "modelineBg", bgAlt),
      modelineFg: colour(scope, "modelineFg", fg),
      inactiveModelineBg: colour(scope, "inactiveModelineBg", bgAlt),
      inactiveModelineFg: colour(scope, "inactiveModelineFg", fgAlt),

      tabBar: colour(scope, "tabBar", bgAlt),
      tabActiveBg: colour(scope, "tabActiveBg", bg),
      tabActiveFg: colour(scope, ["tabActiveFg", "tabActive"], fg),
      tabInactiveBg: colour(scope, "tabInactiveBg", bgAlt),
      tabInactiveFg: colour(scope, ["tabInactiveFg", "tabInactive"], fgAlt),
      tabIndicator: colour(scope, ["tabIndicator", "tabActiveBar", "accent"], accent),
      tabModified: colour(scope, ["tabModified", "tabModifiedFg", "accent"], accent),
      tabClose: colour(scope, ["tabClose", "tabCloseFg", "fgAlt"], fgAlt),

      added: colour(scope, "added", "#a6e3a1"),
      changed: colour(scope, "changed", "#f9e2af"),
      removed: colour(scope, "removed", "#f38ba8"),

      lineNumberBg: colour(scope, ["lineNumberBg", "bgAlt"], bgAlt),
      lineNumberFg: colour(scope, ["lineNumberFg", "fgAlt"], fgAlt),
      currentLineNumberBg: colour(scope, ["currentLineNumberBg", "hlLine"], hlLine),
      currentLineNumberFg: colour(scope, ["currentLineNumberFg", "hlLineFg", "fg"], fg),
    };
  }

  function previewArea(scope) {
    return scope.querySelector("[data-tc-preview-area]") ||
           scope.querySelector(".tc-preview") ||
           scope.querySelector(".theme-creator-preview");
  }

  function applyVars(area, p) {
    const vars = {
      "--tc-v184-bg": p.bg,
      "--tc-v184-fg": p.fg,
      "--tc-v184-bg-alt": p.bgAlt,
      "--tc-v184-fg-alt": p.fgAlt,
      "--tc-v184-accent": p.accent,
      "--tc-v184-region": p.region,
      "--tc-v184-selection-fg": p.selectionFg,
      "--tc-v184-hl-line": p.hlLine,
      "--tc-v184-hl-line-fg": p.hlLineFg,

      "--tc-v184-comment": p.comments,
      "--tc-v184-keyword": p.keywords,
      "--tc-v184-function": p.functions,
      "--tc-v184-variable": p.variables,
      "--tc-v184-string": p.strings,

      "--tc-v184-modeline-bg": p.modelineBg,
      "--tc-v184-modeline-fg": p.modelineFg,
      "--tc-v184-inactive-modeline-bg": p.inactiveModelineBg,
      "--tc-v184-inactive-modeline-fg": p.inactiveModelineFg,

      "--tc-v184-tab-bar": p.tabBar,
      "--tc-v184-tab-active-bg": p.tabActiveBg,
      "--tc-v184-tab-active-fg": p.tabActiveFg,
      "--tc-v184-tab-inactive-bg": p.tabInactiveBg,
      "--tc-v184-tab-inactive-fg": p.tabInactiveFg,
      "--tc-v184-tab-indicator": p.tabIndicator,
      "--tc-v184-tab-modified": p.tabModified,
      "--tc-v184-tab-close": p.tabClose,

      "--tc-v184-added": p.added,
      "--tc-v184-changed": p.changed,
      "--tc-v184-removed": p.removed,

      "--tc-v184-line-number-bg": p.lineNumberBg,
      "--tc-v184-line-number-fg": p.lineNumberFg,
      "--tc-v184-current-line-number-bg": p.currentLineNumberBg,
      "--tc-v184-current-line-number-fg": p.currentLineNumberFg,
    };

    Object.entries(vars).forEach(([key, value]) => {
      area.style.setProperty(key, value);
    });
  }

  function ensureCoverage(area) {
    let coverage = area.querySelector("[data-tc-v184-coverage]");
    if (coverage) return coverage;

    coverage = document.createElement("section");
    coverage.className = "tc-v184-coverage";
    coverage.setAttribute("data-tc-v184-coverage", "true");
    coverage.setAttribute("aria-label", "Theme property coverage");

    coverage.innerHTML = `
      <div class="tc-v184-coverage-title">Theme property coverage</div>

      <div class="tc-v184-coverage-grid">
        <div class="tc-v184-card tc-v184-core">
          <strong>Core</strong>
          <span>Background / Foreground / Accent</span>
        </div>

        <div class="tc-v184-card tc-v184-selection">
          <strong>Selection</strong>
          <span>Selected text uses region + selection text</span>
        </div>

        <div class="tc-v184-card tc-v184-current-line">
          <strong>Current line</strong>
          <span>Line + current line-number focus</span>
        </div>

        <div class="tc-v184-card tc-v184-syntax">
          <strong>Syntax</strong>
          <code><span class="tc-v184-comment">;; comment</span> <span class="tc-v184-keyword">(setq</span> <span class="tc-v184-variable">name</span> <span class="tc-v184-string">"value"</span><span class="tc-v184-keyword">)</span></code>
        </div>

        <div class="tc-v184-card tc-v184-tabs-demo">
          <strong>Tabs</strong>
          <span class="tc-v184-tab is-active"><i></i>ui.org <b>✕</b></span>
          <span class="tc-v184-tab is-modified"><i></i>hydras.org <em>●</em><b>✕</b></span>
          <span class="tc-v184-tab">init.el <b>✕</b></span>
        </div>

        <div class="tc-v184-card tc-v184-modelines">
          <strong>Mode line</strong>
          <span class="tc-v184-modeline-active">ui.org  Org</span>
          <span class="tc-v184-modeline-inactive">hydras.org  Modified</span>
        </div>

        <div class="tc-v184-card tc-v184-diff">
          <strong>Diff / VC</strong>
          <span class="tc-v184-added">+ added line</span>
          <span class="tc-v184-changed">~ changed line</span>
          <span class="tc-v184-removed">- removed line</span>
        </div>

        <div class="tc-v184-card tc-v184-gutter-demo">
          <strong>Gutter</strong>
          <span><b>142</b><code>normal line</code></span>
          <span class="is-current"><b>143</b><code>current line</code></span>
        </div>
      </div>
    `;

    area.appendChild(coverage);
    return coverage;
  }

  function markPreview(area) {
    area.classList.add("tc-v184-doom-match-preview");

    area.querySelectorAll("code").forEach((code) => {
      if (code.closest(".tc-preview-tabs, .tc-preview-top, [data-tc-preview-tab], .tc-v184-coverage")) return;
      code.classList.add("tc-v184-code-gap");
    });

    area.querySelectorAll("[data-tc-preview-tab]").forEach((tab) => {
      tab.classList.add("tc-v184-doom-tab");

      if (!tab.querySelector("[data-tc-preview-tab-close-v184]")) {
        const close = document.createElement("span");
        close.className = "tc-preview-tab-close-v184";
        close.setAttribute("data-tc-preview-tab-close-v184", "true");
        close.setAttribute("aria-hidden", "true");
        close.textContent = "✕";
        tab.appendChild(close);
      }
    });
  }

  function apply(root = document) {
    const scope = scopeFor(root);
    const area = previewArea(scope);

    if (!area) {
      return { version: window.themeCreatorScriptVersion, ok: false, reason: "no-preview-area" };
    }

    const p = palette(scope);
    applyVars(area, p);
    markPreview(area);
    ensureCoverage(area);

    window.themeCreatorV184LastPreview = {
      version: window.themeCreatorScriptVersion,
      ok: true,
      coverage: !!area.querySelector("[data-tc-v184-coverage]"),
      tabs: area.querySelectorAll(".tc-v184-doom-tab").length,
      codeGaps: area.querySelectorAll(".tc-v184-code-gap").length,
      palette: p
    };

    return window.themeCreatorV184LastPreview;
  }

  function schedule(root = document) {
    requestAnimationFrame(() => apply(root));
    setTimeout(() => apply(root), 80);
    setTimeout(() => apply(root), 220);
    setTimeout(() => apply(root), 650);
    setTimeout(() => apply(root), 1200);
  }

  if (typeof updatePreview === "function" && !updatePreview.themeCreatorV184Wrapped) {
    const previousUpdatePreview = updatePreview;

    updatePreview = function themeCreatorV184UpdatePreview(root) {
      const result = previousUpdatePreview(root);
      schedule(root || document);
      return result;
    };

    updatePreview.themeCreatorV184Wrapped = true;
  }

  document.addEventListener("click", (event) => {
    if (event.target && event.target.closest("[data-tc-preview-tab], [data-tc-preview-nav], [data-tc-preview]")) {
      schedule(scopeFor(event.target));
    }
  }, true);

  document.addEventListener("input", (event) => {
    if (event.target && event.target.matches("[data-tc-color], [data-tc-transparency]")) {
      schedule(scopeFor(event.target));
    }
  }, true);

  document.addEventListener("change", (event) => {
    if (event.target && event.target.matches("[data-tc-color], [data-tc-transparency]")) {
      schedule(scopeFor(event.target));
    }
  }, true);

  window.themeCreatorV184ApplyDoomMatchPreview = apply;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => schedule(document), { once: true });
  } else {
    schedule(document);
  }
})();
/* Theme Creator v184 Doom match preview polish end */




/* Theme Creator v187 preview cleanup no minimap begin */
(function themeCreatorPreviewCleanupNoMinimapV187() {
  function scopeFor(node) {
    if (node && node.closest) {
      return node.closest(".tc-modal") || node.closest("[data-theme-creator]") || document;
    }
    if (node && node.querySelector) return node;
    return document;
  }

  function validHex(value) {
    return /^#[0-9a-fA-F]{6}$/.test(String(value || "").trim());
  }

  function colour(scope, keys, fallback) {
    const list = Array.isArray(keys) ? keys : [keys];

    for (const key of list) {
      const generated = scope.querySelector(`[data-v146-generated][data-tc-color="${key}"]`);
      const normal = scope.querySelector(`[data-tc-color="${key}"]`);
      const original = scope.querySelector(`[data-tc-color-original-v146="${key}"]`);

      const value =
        (generated && generated.value) ||
        (normal && normal.value) ||
        (original && original.value);

      if (validHex(value)) return value;
    }

    return fallback;
  }

  function palette(scope) {
    const bg = colour(scope, "bg", "#11111b");
    const fg = colour(scope, "fg", "#cdd6f4");
    const bgAlt = colour(scope, "bgAlt", "#181825");
    const fgAlt = colour(scope, "fgAlt", "#a6adc8");
    const accent = colour(scope, "accent", "#89b4fa");

    return {
      bg,
      fg,
      bgAlt,
      fgAlt,
      accent,

      region: colour(scope, "region", "#313244"),
      selectionFg: colour(scope, "selectionFg", "#ffffff"),

      tabBar: colour(scope, "tabBar", bgAlt),
      tabActiveBg: colour(scope, "tabActiveBg", bg),
      tabActiveFg: colour(scope, ["tabActiveFg", "tabActive"], fg),
      tabInactiveBg: colour(scope, "tabInactiveBg", bgAlt),
      tabInactiveFg: colour(scope, ["tabInactiveFg", "tabInactive"], fgAlt),

      // Correct mapping:
      // Tab Indicator = active tab top border.
      // Tab Bar Background = tab strip only.
      tabIndicator: colour(scope, ["tabIndicator", "tabActiveBar", "accent"], accent),
      tabClose: colour(scope, ["tabClose", "tabCloseFg", "fgAlt"], fgAlt),
    };
  }

  function previewArea(scope) {
    return scope.querySelector("[data-tc-preview-area]") ||
           scope.querySelector(".tc-preview") ||
           scope.querySelector(".theme-creator-preview");
  }

  function activeKind(scope) {
    try {
      if (typeof activePreview !== "undefined") return activePreview;
    } catch (_) {}

    const tab =
      scope.querySelector("[data-tc-preview-tab].is-active") ||
      scope.querySelector("[data-tc-preview-tab][aria-selected='true']");

    return tab ? tab.getAttribute("data-tc-preview-tab") : "";
  }

  function setVars(area, p) {
    area.style.setProperty("--tc-v187-bg", p.bg);
    area.style.setProperty("--tc-v187-fg", p.fg);
    area.style.setProperty("--tc-v187-bg-alt", p.bgAlt);
    area.style.setProperty("--tc-v187-fg-alt", p.fgAlt);
    area.style.setProperty("--tc-v187-accent", p.accent);

    area.style.setProperty("--tc-v187-region", p.region);
    area.style.setProperty("--tc-v187-selection-fg", p.selectionFg);

    area.style.setProperty("--tc-v187-tab-bar", p.tabBar);
    area.style.setProperty("--tc-v187-tab-active-bg", p.tabActiveBg);
    area.style.setProperty("--tc-v187-tab-active-fg", p.tabActiveFg);
    area.style.setProperty("--tc-v187-tab-inactive-bg", p.tabInactiveBg);
    area.style.setProperty("--tc-v187-tab-inactive-fg", p.tabInactiveFg);
    area.style.setProperty("--tc-v187-tab-indicator", p.tabIndicator);
    area.style.setProperty("--tc-v187-tab-close", p.tabClose);
  }

  function removeWrongPreviewAdditions(area) {
    // Remove the v186 minimap column completely.
    area.querySelectorAll("[data-tc-v186-minimap], .tc-v186-minimap").forEach((node) => {
      node.remove();
    });

    // Remove the v185 fake dashboard. The older live dashboard fetcher owns this tab.
    area.classList.remove("tc-v185-dashboard-active");
    area.querySelectorAll("[data-tc-v185-dashboard-preview], .tc-v185-dashboard-preview").forEach((node) => {
      node.remove();
    });
  }

  function normaliseTabs(scope, area) {
    scope.querySelectorAll("[data-tc-preview-tab]").forEach((tab) => {
      tab.classList.add("tc-v187-preview-tab");

      tab.querySelectorAll(
        "[data-tc-preview-tab-close-v173], [data-tc-preview-tab-close-v184], [data-tc-preview-tab-close-v185], [data-tc-preview-tab-close-v186], [data-tc-preview-tab-close-v187]"
      ).forEach((node) => node.remove());

      tab.querySelectorAll(
        "[data-tc-preview-tab-modified-v182], [data-tc-preview-tab-modified-v183], [data-tc-preview-tab-modified-v184], [data-tc-preview-tab-modified-v186], [data-tc-preview-tab-modified-v187]"
      ).forEach((node) => node.remove());

      const close = document.createElement("span");
      close.className = "tc-preview-tab-close-v187";
      close.setAttribute("data-tc-preview-tab-close-v187", "true");
      close.setAttribute("aria-hidden", "true");
      close.textContent = "✕";
      tab.appendChild(close);
    });

    area.classList.add("tc-v187-tabs-fixed");
  }

  function hideOriginalModifiedLabels(area) {
    [...area.querySelectorAll("*")].forEach((node) => {
      if (node.closest("code, pre, [data-tc-preview-tab], .tc-preview-tabs, .tc-preview-top")) return;

      const text = (node.textContent || "").trim();
      if (text !== "Original" && text !== "Modified") return;
      if (node.children.length > 0) return;

      node.classList.add("tc-v187-hidden-original-modified-label");
    });
  }

  function kickLiveDashboardFetcher(scope) {
    if (activeKind(scope) !== "dashboard") return;

    [
      "themeCreatorFetchDoomDashboard",
      "themeCreatorFetchDashboard",
      "themeCreatorLoadDoomDashboard",
      "themeCreatorLoadDashboardPreview",
      "themeCreatorFetchDashboardPreview",
      "themeCreatorRefreshDashboardPreview"
    ].forEach((name) => {
      const fn = window[name];
      if (typeof fn === "function") {
        try { fn(scope); } catch (_) {}
      }
    });
  }

  function apply(root = document) {
    const scope = scopeFor(root);
    const area = previewArea(scope);

    if (!area) {
      return { version: window.themeCreatorScriptVersion, ok: false, reason: "no-preview-area" };
    }

    const p = palette(scope);

    setVars(area, p);
    removeWrongPreviewAdditions(area);
    normaliseTabs(scope, area);
    hideOriginalModifiedLabels(area);
    kickLiveDashboardFetcher(scope);

    area.classList.add("tc-v187-preview-clean");

    window.themeCreatorV187LastPreviewCleanup = {
      version: window.themeCreatorScriptVersion,
      ok: true,
      activeKind: activeKind(scope),
      minimapRemoved: !area.querySelector("[data-tc-v186-minimap], .tc-v186-minimap"),
      fakeDashboardRemoved: !area.querySelector("[data-tc-v185-dashboard-preview], .tc-v185-dashboard-preview"),
      closeIcons: scope.querySelectorAll("[data-tc-preview-tab-close-v187]").length,
      oldCloseIcons: scope.querySelectorAll("[data-tc-preview-tab-close-v173], [data-tc-preview-tab-close-v184], [data-tc-preview-tab-close-v185], [data-tc-preview-tab-close-v186]").length,
      oldModifiedDots: scope.querySelectorAll("[data-tc-preview-tab-modified-v182], [data-tc-preview-tab-modified-v183], [data-tc-preview-tab-modified-v184], [data-tc-preview-tab-modified-v186]").length,
      tabTopBorderUses: "tabIndicator",
      tabBarUses: "tabBar",
      palette: p,
    };

    return window.themeCreatorV187LastPreviewCleanup;
  }

  function schedule(root = document) {
    requestAnimationFrame(() => apply(root));
    setTimeout(() => apply(root), 80);
    setTimeout(() => apply(root), 240);
    setTimeout(() => apply(root), 700);
    setTimeout(() => apply(root), 1300);
  }

  if (typeof updatePreview === "function" && !updatePreview.themeCreatorV187Wrapped) {
    const previousUpdatePreview = updatePreview;

    updatePreview = function themeCreatorV187UpdatePreview(root) {
      const result = previousUpdatePreview(root);
      schedule(root || document);
      return result;
    };

    updatePreview.themeCreatorV187Wrapped = true;
  }

  if (typeof setActivePreview === "function" && !setActivePreview.themeCreatorV187Wrapped) {
    const previousSetActivePreview = setActivePreview;

    setActivePreview = function themeCreatorV187SetActivePreview(root, kind) {
      const result = previousSetActivePreview(root, kind);
      schedule(root || document);
      return result;
    };

    setActivePreview.themeCreatorV187Wrapped = true;
  }

  document.addEventListener("click", (event) => {
    if (event.target && event.target.closest("[data-tc-preview-tab], [data-tc-preview-nav], [data-tc-preview]")) {
      schedule(scopeFor(event.target));
    }
  }, true);

  document.addEventListener("input", (event) => {
    if (event.target && event.target.matches("[data-tc-color], [data-tc-transparency]")) {
      schedule(scopeFor(event.target));
    }
  }, true);

  document.addEventListener("change", (event) => {
    if (event.target && event.target.matches("[data-tc-color], [data-tc-transparency]")) {
      schedule(scopeFor(event.target));
    }
  }, true);

  window.themeCreatorV187ApplyPreviewCleanup = apply;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => schedule(document), { once: true });
  } else {
    schedule(document);
  }
})();
/* Theme Creator v187 preview cleanup no minimap end */










window.themeCreatorScriptVersion = VERSION;
  window.themeCreatorLastError = null;
  window.themeCreatorRebuild = buildCreator;
    window.themeCreatorOpen = openThemeCreator;
})();


// Theme Creator v98: clean status-only dashboard/event bridge.
// No MutationObserver. No dashboard-only endpoints. No layout changes.
(() => {
  if (window.__themeCreatorEventBridgeV98) return;
  window.__themeCreatorEventBridgeV98 = true;

  const STYLE_ID = "theme-creator-event-bridge-v98";

  function normalise(text) {
    return String(text || "")
      .replace(/#[0-9a-fA-F]{3,8}/g, "")
      .replace(/\bcurrent value\b/gi, "")
      .replace(/\bcolou?r\b/gi, "")
      .replace(/[^a-zA-Z0-9]+/g, " ")
      .trim()
      .toLowerCase();
  }

  function hexFrom(value) {
    const raw = String(value || "");
    const hex = raw.match(/#[0-9a-fA-F]{6}\b/);
    if (hex) return hex[0];

    const rgb = raw.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (!rgb) return "";

    return "#" + [rgb[1], rgb[2], rgb[3]]
      .map((n) => Math.max(0, Math.min(255, Number(n))).toString(16).padStart(2, "0"))
      .join("");
  }

  function safeCss(value, fallback) {
    return String(value || fallback || "").replace(/[^#a-zA-Z0-9(),.%\s-]/g, "");
  }

  function colourControls(modal) {
    if (!modal) return [];

    return [...modal.querySelectorAll(`
      .tc-colour-grid input[type="color"],
      .tc-color-grid input[type="color"],
      .tc-colours-grid input[type="color"],
      .tc-colour-roles input[type="color"],
      .tc-colour-grid [data-tc-colour],
      .tc-colour-grid [data-tc-color],
      .tc-color-grid [data-tc-colour],
      .tc-color-grid [data-tc-color],
      .tc-colours-grid [data-tc-colour],
      .tc-colours-grid [data-tc-color],
      .tc-colour-roles [data-tc-colour],
      .tc-colour-roles [data-tc-color]
    `)];
  }

  function controlValue(control) {
    return hexFrom(
      control.value ||
      control.getAttribute("data-value") ||
      control.getAttribute("aria-valuetext") ||
      control.style.backgroundColor ||
      ""
    );
  }

  function controlText(control) {
    const row = control.closest(
      ".tc-colour-row,.tc-color-row,.tc-colour-field,.tc-color-field,.tc-colour-item,.tc-color-item"
    );
    const label = row && row.querySelector("label,.tc-colour-label,.tc-color-label");

    return normalise([
      control.dataset && control.dataset.tcColour,
      control.dataset && control.dataset.tcColor,
      control.dataset && control.dataset.colour,
      control.dataset && control.dataset.color,
      control.dataset && control.dataset.role,
      control.dataset && control.dataset.key,
      control.getAttribute("name"),
      control.getAttribute("id"),
      control.getAttribute("aria-label"),
      control.getAttribute("title"),
      label && label.textContent,
      row && row.textContent
    ].filter(Boolean).join(" "));
  }

  function roleFor(control) {
    const text = controlText(control);

    if (/\bdiff\b/.test(text) && /\b(add|added)\b/.test(text)) return "diffAdded";
    if (/\bdiff\b/.test(text) && /\b(change|changed)\b/.test(text)) return "diffChanged";
    if (/\bdiff\b/.test(text) && /\b(remove|removed)\b/.test(text)) return "diffRemoved";

    if (/\btab\b/.test(text) && /\bbar\b/.test(text)) return "tabBar";
    if (/\btab\b/.test(text) && /\b(current|active|selected)\b/.test(text) && /\b(bg|background)\b/.test(text)) return "tabCurrentBg";
    if (/\btab\b/.test(text) && /\b(current|active|selected)\b/.test(text) && /\b(fg|foreground)\b/.test(text)) return "tabCurrentFg";
    if (/\btab\b/.test(text) && /\b(other|inactive|normal)\b/.test(text) && /\b(bg|background)\b/.test(text)) return "tabOtherBg";
    if (/\btab\b/.test(text) && /\b(other|inactive|normal)\b/.test(text) && /\b(fg|foreground)\b/.test(text)) return "tabOtherFg";

    return "";
  }

  function collectColours(modal) {
    const out = {};

    for (const control of colourControls(modal)) {
      const role = roleFor(control);
      const value = controlValue(control);
      if (role && value) out[role] = value;
    }

    return out;
  }

  function activeTab(modal) {
    return modal.querySelector('.tc-preview-tab.is-active[aria-selected="true"]') ||
           modal.querySelector('.tc-preview-tab[aria-selected="true"]') ||
           modal.querySelector(".tc-preview-tab.is-active") ||
           modal.querySelector(".tc-preview-tab");
  }

  function activeKind(modal) {
    const tab = activeTab(modal);
    return tab ? tab.getAttribute("data-tc-preview-tab") : "";
  }

  function setImportant(el, prop, value) {
    if (!el || !value) return;
    el.style.setProperty(prop, value, "important");
  }

  function writeStyle(colours) {
    let style = document.getElementById(STYLE_ID);

    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }

    const tabBar = safeCss(colours.tabBar, "var(--tc-tab-bar, #89b4fa)");
    const currentBg = safeCss(colours.tabCurrentBg, "var(--tc-tab-current-bg, #313244)");
    const currentFg = safeCss(colours.tabCurrentFg, "var(--tc-tab-current-fg, #cdd6f4)");
    const otherBg = safeCss(colours.tabOtherBg, "var(--tc-tab-other-bg, #181825)");
    const otherFg = safeCss(colours.tabOtherFg, "var(--tc-tab-other-fg, #bac2de)");
    const neutral = "var(--tc-region, #313244)";

    style.textContent = `
/* generated by Theme Creator v98 */
.tc-modal .tc-preview-tab {
  background: ${otherBg} !important;
  color: ${otherFg} !important;
  border-top-color: ${neutral} !important;
  box-shadow: none !important;
}
.tc-modal .tc-preview-tab .tc-tab-label,
.tc-modal .tc-preview-tab .tc-tab-icon,
.tc-modal .tc-preview-tab .tc-tab-mod {
  color: ${otherFg} !important;
}
.tc-modal .tc-preview-tab.is-active,
.tc-modal .tc-preview-tab[aria-selected="true"] {
  background: ${currentBg} !important;
  color: ${currentFg} !important;
  border-top-color: ${tabBar} !important;
  box-shadow: none !important;
}
.tc-modal .tc-preview-tab.is-active .tc-tab-label,
.tc-modal .tc-preview-tab.is-active .tc-tab-icon,
.tc-modal .tc-preview-tab.is-active .tc-tab-mod,
.tc-modal .tc-preview-tab[aria-selected="true"] .tc-tab-label,
.tc-modal .tc-preview-tab[aria-selected="true"] .tc-tab-icon,
.tc-modal .tc-preview-tab[aria-selected="true"] .tc-tab-mod {
  color: ${currentFg} !important;
}
.tc-modal .tc-centaur-nav {
  background: ${otherBg} !important;
  color: ${otherFg} !important;
  border-top-color: ${neutral} !important;
  box-shadow: none !important;
}
.tc-modal .tc-centaur-nav:hover,
.tc-modal .tc-centaur-nav:focus-visible,
.tc-modal .tc-centaur-nav:active,
.tc-modal .tc-centaur-nav[data-tc-nav-active="true"] {
  background: ${currentBg} !important;
  color: ${currentFg} !important;
  border-top-color: ${tabBar} !important;
  box-shadow: none !important;
}
.tc-modal.is-dashboard-preview .tc-ab {
  grid-template-columns: minmax(0, 1fr) !important;
}
.tc-modal.is-dashboard-preview .tc-ab .tc-pane:nth-child(2) {
  display: none !important;
}
.tc-modal.is-dashboard-preview .tc-code {
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  align-items: center !important;
  text-align: center !important;
  padding: 18px 24px !important;
}
.tc-modal.is-dashboard-preview .tc-code-line {
  display: flex !important;
  justify-content: center !important;
  width: 100% !important;
  grid-template-columns: none !important;
  text-align: center !important;
}
.tc-modal.is-dashboard-preview .tc-code-line > :first-child {
  display: none !important;
}
.tc-modal.is-dashboard-preview .tc-code-line > :last-child {
  display: block !important;
  width: auto !important;
  max-width: 96ch !important;
  text-align: center !important;
}
.tc-modal.is-dashboard-preview .tc-pane:first-child .tc-pane-title {
  justify-content: center !important;
}
`;
  }

  function applyDashboardMode(modal) {
    const isDashboard = activeKind(modal) === "dashboard";
    modal.classList.toggle("is-dashboard-preview", isDashboard);

    const titles = modal.querySelectorAll(".tc-pane-title");

    if (titles[0]) {
      if (!titles[0].dataset.tcOriginalTitle) {
        titles[0].dataset.tcOriginalTitle = titles[0].textContent || "Original";
      }
      titles[0].textContent = isDashboard ? "Doom Dashboard" : titles[0].dataset.tcOriginalTitle;
    }

    if (titles[1] && titles[1].dataset.tcOriginalTitle) {
      titles[1].textContent = titles[1].dataset.tcOriginalTitle;
    }
  }

  function paintTabs(modal, colours) {
    const active = activeTab(modal);

    for (const tab of modal.querySelectorAll(".tc-preview-tab")) {
      const isActive = tab === active;

      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", isActive ? "true" : "false");

      setImportant(tab, "background-color", isActive ? colours.tabCurrentBg : colours.tabOtherBg);
      setImportant(tab, "color", isActive ? colours.tabCurrentFg : colours.tabOtherFg);
      setImportant(tab, "border-top-color", isActive ? colours.tabBar : "var(--tc-region, #313244)");
      tab.style.setProperty("box-shadow", "none", "important");

      for (const child of tab.querySelectorAll(".tc-tab-label,.tc-tab-icon,.tc-tab-mod")) {
        setImportant(child, "color", isActive ? colours.tabCurrentFg : colours.tabOtherFg);
      }
    }
  }

  function paintDiff(modal, colours) {
    const roles = {
      diffAdded: {
        value: colours.diffAdded,
        words: /\b(add|added)\b/,
        selectors: ".tc-diff-added,.tc-diff-add,.tc-line-added,.tc-line-add,.diff-added,.diff-add,.is-added,.is-add,[data-tc-diff='added'],[data-tc-diff='add'],[data-diff='added'],[data-diff='add']"
      },
      diffChanged: {
        value: colours.diffChanged,
        words: /\b(change|changed)\b/,
        selectors: ".tc-diff-changed,.tc-diff-change,.tc-line-changed,.tc-line-change,.diff-changed,.diff-change,.is-changed,.is-change,[data-tc-diff='changed'],[data-tc-diff='change'],[data-diff='changed'],[data-diff='change']"
      },
      diffRemoved: {
        value: colours.diffRemoved,
        words: /\b(remove|removed)\b/,
        selectors: ".tc-diff-removed,.tc-diff-remove,.tc-line-removed,.tc-line-remove,.diff-removed,.diff-remove,.is-removed,.is-remove,[data-tc-diff='removed'],[data-tc-diff='remove'],[data-diff='removed'],[data-diff='remove']"
      }
    };

    for (const item of Object.values(roles)) {
      if (!item.value) continue;

      for (const el of modal.querySelectorAll(item.selectors)) {
        setImportant(el, "background-color", item.value);
      }

      for (const line of modal.querySelectorAll(".tc-code-line,.tc-line,.tc-code-row")) {
        const text = normalise([
          line.className,
          line.getAttribute("data-tc-diff"),
          line.getAttribute("data-diff"),
          line.getAttribute("data-kind")
        ].filter(Boolean).join(" "));

        if (item.words.test(text)) {
          setImportant(line, "background-color", item.value);
        }
      }
    }
  }

  function applyAll() {
    const modal = document.querySelector(".tc-modal");
    if (!modal) return;

    const picked = collectColours(modal);

    const colours = {
      tabBar: picked.tabBar || "var(--tc-tab-bar, #89b4fa)",
      tabCurrentBg: picked.tabCurrentBg || "var(--tc-tab-current-bg, #313244)",
      tabCurrentFg: picked.tabCurrentFg || "var(--tc-tab-current-fg, #cdd6f4)",
      tabOtherBg: picked.tabOtherBg || "var(--tc-tab-other-bg, #181825)",
      tabOtherFg: picked.tabOtherFg || "var(--tc-tab-other-fg, #bac2de)",
      diffAdded: picked.diffAdded,
      diffChanged: picked.diffChanged,
      diffRemoved: picked.diffRemoved
    };

    writeStyle(colours);
    paintTabs(modal, colours);
    paintDiff(modal, colours);
    applyDashboardMode(modal);
  }

  let applyTimer = 0;

  function scheduleApply() {
    clearTimeout(applyTimer);
    applyTimer = setTimeout(applyAll, 20);
  }

  async function fetchLiveDashboard(force) {
    if (window.themeCreatorLiveDashboardLoading) return;
    if (!force && Array.isArray(window.themeCreatorLiveDashboardLines)) return;

    window.themeCreatorLiveDashboardLoading = true;
    window.themeCreatorLiveDashboardError = null;

    if (typeof window.themeCreatorRebuild === "function") {
      window.themeCreatorRebuild();
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const endpoint = "/theme-gallery/live-dashboard.json";
      const response = await fetch(endpoint + "?ts=" + Date.now(), {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
        headers: { "Accept": "application/json,text/plain,*/*" }
      });

      const raw = await response.text();
      const prefix = raw.slice(0, 260).replace(/\s+/g, " ").trim();

      if (!response.ok) {
        throw new Error(`${endpoint} returned HTTP ${response.status}: ${prefix}`);
      }

      let data = null;

      try {
        data = JSON.parse(raw);
      } catch (_) {
        throw new Error(`${endpoint} returned non-JSON: ${prefix}`);
      }

      if (!data || data.ok === false) {
        throw new Error(`${endpoint} returned JSON error: ${(data && data.error) || "unknown error"}`);
      }
      if (data.ok === false) {
        throw new Error(data.error || "Static dashboard JSON could not read Doom Dashboard.");
      }

      window.themeCreatorLiveDashboardLines = Array.isArray(data.lines)
        ? data.lines.slice(0, 180).map((line) => String(line).slice(0, 220))
        : [];

      if (!window.themeCreatorLiveDashboardLines.length) {
        throw new Error("Static dashboard JSON loaded, but lines was empty.");
      }

      window.themeCreatorLiveDashboardError = null;
    } catch (err) {
      window.themeCreatorLiveDashboardLines = null;
      window.themeCreatorLiveDashboardError = err && err.message ? err.message : String(err);
    } finally {
      window.themeCreatorLiveDashboardLoading = false;
      clearTimeout(timeout);

      if (typeof window.themeCreatorRebuild === "function") {
        window.themeCreatorRebuild();
      }

      scheduleApply();
    }
  }

  const originalOpen = window.themeCreatorOpen;

  if (typeof originalOpen === "function") {
    window.themeCreatorOpen = function themeCreatorOpenV98(...args) {
      const result = originalOpen.apply(this, args);

      setTimeout(() => {
        scheduleApply();
        const modal = document.querySelector(".tc-modal");
        if (modal && activeKind(modal) === "dashboard") {
          fetchLiveDashboard(false);
        }
      }, 80);

      return result;
    };
  }

  document.addEventListener("input", (event) => {
    if (!event.target.closest || !event.target.closest(".tc-modal")) return;

    if (event.target.matches('input[type="color"],[data-tc-colour],[data-tc-color]')) {
      scheduleApply();
    }
  }, true);

  document.addEventListener("change", (event) => {
    if (!event.target.closest || !event.target.closest(".tc-modal")) return;

    if (event.target.matches('input[type="color"],[data-tc-colour],[data-tc-color]')) {
      scheduleApply();
    }
  }, true);

  document.addEventListener("click", (event) => {
    const modal = event.target.closest && event.target.closest(".tc-modal");
    if (!modal) return;

    const tab = event.target.closest(".tc-preview-tab");
    const nav = event.target.closest(".tc-centaur-nav");

    if (tab) {
      setTimeout(() => {
        scheduleApply();

        if (tab.getAttribute("data-tc-preview-tab") === "dashboard") {
          fetchLiveDashboard(true);
        }
      }, 30);
    }

    if (nav) {
      nav.dataset.tcNavActive = "true";
      setTimeout(() => {
        nav.dataset.tcNavActive = "false";
        scheduleApply();
      }, 140);
    }
  }, true);

  window.themeCreatorApplyEventBridge = applyAll;
  window.themeCreatorFetchLiveDashboard = fetchLiveDashboard;

  setTimeout(scheduleApply, 100);
})();

/* Theme Creator v99: dashboard via static JSON file.
   The Doom Dashboard tab now reads /theme-gallery/live-dashboard.json,
   which is written by the running Emacs daemon. */

/* Theme Creator v100: dashboard static file path fix.
   The Doom Dashboard tab reads ./live-dashboard.json or
   /theme-gallery/live-dashboard.json, both written by Emacs into the served
   theme-gallery directory. */

/* Theme Creator v101: direct static live dashboard JSON.
   The Doom Dashboard tab reads live-dashboard.json from the served
   theme-gallery directory. */


// Theme Creator v105: compact aligned Doom Dashboard block.
// No Theme Creator layout changes. Dashboard rendering only.
(() => {
  if (window.__themeCreatorDashboardBlockV105) return;
  window.__themeCreatorDashboardBlockV105 = true;

  const STYLE_ID = "theme-creator-dashboard-block-v105";

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function dashboardIsActive() {
    const modal = document.querySelector(".tc-modal");
    if (!modal) return false;

    const tab =
      modal.querySelector('.tc-preview-tab.is-active[aria-selected="true"]') ||
      modal.querySelector('.tc-preview-tab[aria-selected="true"]') ||
      modal.querySelector(".tc-preview-tab.is-active");

    return !!tab && tab.getAttribute("data-tc-preview-tab") === "dashboard";
  }

  function ensureStyle() {
    let style = document.getElementById(STYLE_ID);

    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }

    style.textContent = `
/* generated by Theme Creator v105 */

.tc-modal.is-dashboard-preview .tc-pane:first-child .tc-pane-title {
  display: none !important;
}

.tc-modal.is-dashboard-preview .tc-pane:first-child {
  display: grid !important;
  grid-template-rows: minmax(0, 1fr) !important;
  background:
    radial-gradient(circle at 50% 42%, color-mix(in srgb, var(--tc-bg-alt, #181825) 68%, transparent), transparent 37%),
    linear-gradient(180deg, color-mix(in srgb, var(--tc-bg, #11111b) 92%, #ffffff 8%), var(--tc-bg, #11111b)) !important;
}

.tc-modal.is-dashboard-preview .tc-code {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;

  min-height: 0 !important;
  height: 100% !important;
  overflow: auto !important;

  padding-top: clamp(42px, 7vh, 88px) !important;
  padding-right: 32px !important;
  padding-bottom: clamp(36px, 6vh, 78px) !important;
  padding-left: 32px !important;

  background: transparent !important;
  color: var(--tc-fg, #cdd6f4) !important;
}

/* One centred block preserves ASCII and menu alignment. */
.tc-modal.is-dashboard-preview .tc-dashboard-pre {
  display: block !important;
  width: max-content !important;
  max-width: min(118ch, 100%) !important;
  margin: 0 auto !important;

  text-align: left !important;
  white-space: normal !important;
  overflow: visible !important;

  font-family:
    "Symbols Nerd Font Mono",
    "Symbols Nerd Font",
    "JetBrainsMono Nerd Font",
    "JetBrainsMono Nerd Font Mono",
    "FiraCode Nerd Font",
    "FiraCode Nerd Font Mono",
    "Iosevka Nerd Font",
    "Iosevka Nerd Font Mono",
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Consolas,
    monospace !important;

  font-size: 13px !important;
  line-height: 1.20 !important;
  color: var(--tc-fg, #cdd6f4) !important;
}

.tc-modal.is-dashboard-preview .tc-dashboard-line {
  display: block !important;
  width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  text-align: left !important;
  white-space: pre !important;
}

/* Remove the visible gap inside the Doom ASCII art. */
.tc-modal.is-dashboard-preview .tc-dashboard-logo {
  color: color-mix(in srgb, var(--tc-comment, #7f849c) 74%, var(--tc-fg, #cdd6f4) 26%) !important;
  opacity: 0.86 !important;
  line-height: 1.00 !important;
}

.tc-modal.is-dashboard-preview .tc-dashboard-emacs {
  color: var(--tc-fg-alt, var(--tc-comment, #a6adc8)) !important;
  opacity: 0.84 !important;
  line-height: 1.00 !important;
}

.tc-modal.is-dashboard-preview .tc-dashboard-blank {
  line-height: 0.86 !important;
}

.tc-modal.is-dashboard-preview .tc-dashboard-menu {
  line-height: 1.55 !important;
}

.tc-modal.is-dashboard-preview .tc-dashboard-icon {
  color: var(--tc-link, var(--tc-function, #89b4fa)) !important;
  font-family:
    "Symbols Nerd Font Mono",
    "Symbols Nerd Font",
    "JetBrainsMono Nerd Font",
    "FiraCode Nerd Font",
    monospace !important;
}

.tc-modal.is-dashboard-preview .tc-dashboard-label {
  color: var(--tc-link, var(--tc-function, #89b4fa)) !important;
}

.tc-modal.is-dashboard-preview .tc-dashboard-key {
  color: var(--tc-keyword, #cba6f7) !important;
}

.tc-modal.is-dashboard-preview .tc-dashboard-status {
  color: var(--tc-comment, #7f849c) !important;
  font-style: italic !important;
  opacity: 0.9 !important;
}

.tc-modal.is-dashboard-preview .tc-dashboard-cat {
  color: var(--tc-success, #a6e3a1) !important;
}
`;
  }

  function collectRenderedLines(code) {
    if (Array.isArray(window.themeCreatorLiveDashboardLines) &&
        window.themeCreatorLiveDashboardLines.length) {
      return window.themeCreatorLiveDashboardLines.map(String);
    }

    const existing = code.querySelector(".tc-dashboard-pre");
    if (existing && code.dataset.tcDashboardRawLinesV105) {
      try {
        return JSON.parse(code.dataset.tcDashboardRawLinesV105);
      } catch (_) {
        return [];
      }
    }

    const rows = [...code.querySelectorAll(".tc-code-line")];

    if (rows.length) {
      return rows.map((row) => {
        const cell = row.lastElementChild || row;
        return cell.textContent || "";
      });
    }

    return [];
  }

  function isMenuLine(text) {
    const value = String(text || "");

    return /\b(Recently opened files|Open org-agenda|Open project|Jump to bookmark|Open private configuration|Open documentation)\b/.test(value) ||
           /^\s*\S+[\t ]{1,}.+?\s{2,}SPC\b/.test(value);
  }

  function classForLine(text) {
    const trimmed = String(text || "").trim();

    if (!trimmed) return "tc-dashboard-blank";
    if (isMenuLine(text)) return "tc-dashboard-menu";
    if (/^Doom loaded\b/.test(trimmed)) return "tc-dashboard-status";
    if (trimmed === "" || trimmed === "" || trimmed === "") return "tc-dashboard-cat";
    if (/E\s+M\s+A\s+C\s+S/.test(text)) return "tc-dashboard-emacs";
    if (/^[\\\/|.=_'`\-\sA-Z]+$/.test(trimmed) || /[\\\/|.=_'`-]{4,}/.test(trimmed)) return "tc-dashboard-logo";

    return "";
  }

  function renderMenuLine(text) {
    const value = String(text || "");

    /* Menu row with keybinding:
       icon + label + spacing + SPC...
    */
    let match = value.match(/^(\s*)(\S+)([\t ]+)(.+?)(\s{2,})(SPC\b.*)$/);

    if (match) {
      return (
        escapeHtml(match[1]) +
        '<span class="tc-dashboard-icon">' + escapeHtml(match[2]) + '</span>' +
        escapeHtml(match[3]) +
        '<span class="tc-dashboard-label">' + escapeHtml(match[4]) + '</span>' +
        escapeHtml(match[5]) +
        '<span class="tc-dashboard-key">' + escapeHtml(match[6]) + '</span>'
      );
    }

    /* Menu row without keybinding, e.g.
         Recently opened files
    */
    match = value.match(/^(\s*)(\S+)([\t ]+)(.+?)(\s*)$/);

    if (match && isMenuLine(value)) {
      return (
        escapeHtml(match[1]) +
        '<span class="tc-dashboard-icon">' + escapeHtml(match[2]) + '</span>' +
        escapeHtml(match[3]) +
        '<span class="tc-dashboard-label">' + escapeHtml(match[4]) + '</span>' +
        escapeHtml(match[5])
      );
    }

    return escapeHtml(value);
  }

  function renderDashboardBlock() {
    ensureStyle();

    const modal = document.querySelector(".tc-modal");
    if (!modal || !dashboardIsActive()) return;

    modal.classList.add("is-dashboard-preview");

    const code = modal.querySelector(".tc-ab .tc-pane:first-child .tc-code");
    if (!code) return;

    const lines = collectRenderedLines(code);
    if (!lines.length) return;

    const source = JSON.stringify(lines);

    if (code.dataset.tcDashboardBlockV105 === source &&
        code.querySelector(".tc-dashboard-pre")) {
      return;
    }

    const html = lines.map((line) => {
      const cls = classForLine(line);
      const content = isMenuLine(line) ? renderMenuLine(line) : escapeHtml(line);

      return '<span class="tc-dashboard-line ' + cls + '">' + content + '</span>';
    }).join("");

    code.dataset.tcDashboardBlockV105 = source;
    code.dataset.tcDashboardRawLinesV105 = source;
    code.innerHTML = '<pre class="tc-dashboard-pre">' + html + '</pre>';
  }

  let timer = 0;

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      requestAnimationFrame(() => {
        renderDashboardBlock();
        requestAnimationFrame(renderDashboardBlock);
      });
    }, 25);
  }

  const originalRebuild = window.themeCreatorRebuild;

  if (typeof originalRebuild === "function" && !originalRebuild.__dashboardBlockV105) {
    const wrapped = function themeCreatorRebuildV105(...args) {
      const result = originalRebuild.apply(this, args);
      schedule();
      return result;
    };

    wrapped.__dashboardBlockV105 = true;
    window.themeCreatorRebuild = wrapped;
  }

  const originalOpen = window.themeCreatorOpen;

  if (typeof originalOpen === "function" && !originalOpen.__dashboardBlockV105) {
    const wrapped = function themeCreatorOpenV105(...args) {
      const result = originalOpen.apply(this, args);
      setTimeout(schedule, 80);
      setTimeout(schedule, 250);
      return result;
    };

    wrapped.__dashboardBlockV105 = true;
    window.themeCreatorOpen = wrapped;
  }

  document.addEventListener("click", (event) => {
    if (!event.target.closest || !event.target.closest(".tc-modal")) return;

    if (event.target.closest(".tc-preview-tab,.tc-centaur-nav")) {
      setTimeout(schedule, 40);
      setTimeout(schedule, 180);
    }
  }, true);

  document.addEventListener("input", (event) => {
    if (!event.target.closest || !event.target.closest(".tc-modal")) return;

    if (event.target.matches('input[type="color"],[data-tc-colour],[data-tc-color]')) {
      schedule();
    }
  }, true);

  document.addEventListener("change", (event) => {
    if (!event.target.closest || !event.target.closest(".tc-modal")) return;

    if (event.target.matches('input[type="color"],[data-tc-colour],[data-tc-color]')) {
      schedule();
    }
  }, true);

  window.themeCreatorRenderDashboardBlock = renderDashboardBlock;

  setTimeout(schedule, 120);
})();

/* Theme Creator v105: ASCII line-gap fix.
   Dashboard lines are rendered as adjacent block spans without newline
   text nodes between them. */


// Theme Creator v106: unsquash Doom Dashboard ASCII spacing.
// Dashboard rendering only. Keeps v105's no-extra-blank-line fix.
(() => {
  if (window.__themeCreatorDashboardSpacingV106) return;
  window.__themeCreatorDashboardSpacingV106 = true;

  const STYLE_ID = "theme-creator-dashboard-spacing-v106";

  function ensureStyle() {
    let style = document.getElementById(STYLE_ID);

    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }

    style.textContent = `
/* generated by Theme Creator v106 */

/* Keep the whole dashboard as one centred block, but stop it looking crushed. */
.tc-modal.is-dashboard-preview .tc-dashboard-pre {
  line-height: 1.30 !important;
}

/* Each rendered dashboard row is a block, so no newline text node is needed.
   This preserves alignment without creating a blank row between each line. */
.tc-modal.is-dashboard-preview .tc-dashboard-line {
  line-height: 1.24 !important;
  min-height: 1.24em !important;
}

/* Doom ASCII wants tighter spacing than the menu, but not fully collapsed. */
.tc-modal.is-dashboard-preview .tc-dashboard-logo {
  line-height: 1.10 !important;
  min-height: 1.10em !important;
}

.tc-modal.is-dashboard-preview .tc-dashboard-emacs {
  line-height: 1.18 !important;
  min-height: 1.18em !important;
}

/* Preserve intentional dashboard blank lines, but keep them compact. */
.tc-modal.is-dashboard-preview .tc-dashboard-blank {
  line-height: 0.72 !important;
  min-height: 0.72em !important;
}

/* Menu rows should breathe like the real dashboard. */
.tc-modal.is-dashboard-preview .tc-dashboard-menu {
  line-height: 1.58 !important;
  min-height: 1.58em !important;
}

.tc-modal.is-dashboard-preview .tc-dashboard-status {
  line-height: 1.45 !important;
  min-height: 1.45em !important;
}

.tc-modal.is-dashboard-preview .tc-dashboard-cat {
  line-height: 1.35 !important;
  min-height: 1.35em !important;
}
`;
  }

  let timer = 0;

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      requestAnimationFrame(ensureStyle);
    }, 20);
  }

  const originalOpen = window.themeCreatorOpen;

  if (typeof originalOpen === "function" && !originalOpen.__dashboardSpacingV106) {
    const wrapped = function themeCreatorOpenV106(...args) {
      const result = originalOpen.apply(this, args);
      setTimeout(schedule, 80);
      setTimeout(schedule, 250);
      return result;
    };

    wrapped.__dashboardSpacingV106 = true;
    window.themeCreatorOpen = wrapped;
  }

  document.addEventListener("click", (event) => {
    if (!event.target.closest || !event.target.closest(".tc-modal")) return;

    if (event.target.closest(".tc-preview-tab,.tc-centaur-nav")) {
      setTimeout(schedule, 40);
      setTimeout(schedule, 180);
    }
  }, true);

  document.addEventListener("input", (event) => {
    if (!event.target.closest || !event.target.closest(".tc-modal")) return;

    if (event.target.matches('input[type="color"],[data-tc-colour],[data-tc-color]')) {
      schedule();
    }
  }, true);

  document.addEventListener("change", (event) => {
    if (!event.target.closest || !event.target.closest(".tc-modal")) return;

    if (event.target.matches('input[type="color"],[data-tc-colour],[data-tc-color]')) {
      schedule();
    }
  }, true);

  window.themeCreatorApplyDashboardSpacing = ensureStyle;

  setTimeout(schedule, 120);
})();


// Theme Creator v107: Doom Dashboard ASCII row height correction.
// Dashboard rendering only. Keeps the block centred and aligned.
(() => {
  if (window.__themeCreatorDashboardSpacingV107) return;
  window.__themeCreatorDashboardSpacingV107 = true;

  const STYLE_ID = "theme-creator-dashboard-spacing-v107";

  function ensureStyle() {
    let style = document.getElementById(STYLE_ID);

    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }

    style.textContent = `
/* generated by Theme Creator v107 */

/* The whole dashboard stays one centred block. */
.tc-modal.is-dashboard-preview .tc-dashboard-pre {
  font-size: 13px !important;
  line-height: 1.34 !important;
}

/* Default dashboard row height. */
.tc-modal.is-dashboard-preview .tc-dashboard-line {
  line-height: 1.34 !important;
  min-height: 1.34em !important;
}

/* The Doom ASCII logo was over-tightened in v105/v106. Restore real height. */
.tc-modal.is-dashboard-preview .tc-dashboard-logo {
  line-height: 1.34 !important;
  min-height: 1.34em !important;
}

/* Keep the E M A C S line close to the logo but not crushed. */
.tc-modal.is-dashboard-preview .tc-dashboard-emacs {
  line-height: 1.28 !important;
  min-height: 1.28em !important;
}

/* Intentional blank dashboard rows should be present, but not huge. */
.tc-modal.is-dashboard-preview .tc-dashboard-blank {
  line-height: 0.95 !important;
  min-height: 0.95em !important;
}

/* Menu/action rows should remain readable and spaced like Doom. */
.tc-modal.is-dashboard-preview .tc-dashboard-menu {
  line-height: 1.58 !important;
  min-height: 1.58em !important;
}

.tc-modal.is-dashboard-preview .tc-dashboard-status {
  line-height: 1.45 !important;
  min-height: 1.45em !important;
}

.tc-modal.is-dashboard-preview .tc-dashboard-cat {
  line-height: 1.35 !important;
  min-height: 1.35em !important;
}
`;
  }

  let timer = 0;

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      requestAnimationFrame(ensureStyle);
    }, 20);
  }

  const originalOpen = window.themeCreatorOpen;

  if (typeof originalOpen === "function" && !originalOpen.__dashboardSpacingV107) {
    const wrapped = function themeCreatorOpenV107(...args) {
      const result = originalOpen.apply(this, args);
      setTimeout(schedule, 80);
      setTimeout(schedule, 250);
      return result;
    };

    wrapped.__dashboardSpacingV107 = true;
    window.themeCreatorOpen = wrapped;
  }

  document.addEventListener("click", (event) => {
    if (!event.target.closest || !event.target.closest(".tc-modal")) return;

    if (event.target.closest(".tc-preview-tab,.tc-centaur-nav")) {
      setTimeout(schedule, 40);
      setTimeout(schedule, 180);
    }
  }, true);

  document.addEventListener("input", (event) => {
    if (!event.target.closest || !event.target.closest(".tc-modal")) return;

    if (event.target.matches('input[type="color"],[data-tc-colour],[data-tc-color]')) {
      schedule();
    }
  }, true);

  document.addEventListener("change", (event) => {
    if (!event.target.closest || !event.target.closest(".tc-modal")) return;

    if (event.target.matches('input[type="color"],[data-tc-colour],[data-tc-color]')) {
      schedule();
    }
  }, true);

  window.themeCreatorApplyDashboardSpacing = ensureStyle;

  setTimeout(schedule, 120);
})();


// Theme Creator v108: neutral Doom Dashboard ASCII logo colour.
// Dashboard rendering only. Keeps menu/keybinding colours separate.
(() => {
  if (window.__themeCreatorDashboardLogoColourV108) return;
  window.__themeCreatorDashboardLogoColourV108 = true;

  const STYLE_ID = "theme-creator-dashboard-logo-colour-v108";

  function ensureStyle() {
    let style = document.getElementById(STYLE_ID);

    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }

    style.textContent = `
/* generated by Theme Creator v108 */

/* The Doom ASCII logo should be neutral/dim, like the real dashboard.
   It must not inherit link/keybinding colours. */
.tc-modal.is-dashboard-preview .tc-dashboard-logo,
.tc-modal.is-dashboard-preview .tc-dashboard-logo *,
.tc-modal.is-dashboard-preview .tc-dashboard-logo .tc-dashboard-icon,
.tc-modal.is-dashboard-preview .tc-dashboard-logo .tc-dashboard-label,
.tc-modal.is-dashboard-preview .tc-dashboard-logo .tc-dashboard-key {
  color: color-mix(
    in srgb,
    var(--tc-comment, #7f849c) 76%,
    var(--tc-fg, #cdd6f4) 24%
  ) !important;
  opacity: 0.88 !important;
  font-style: normal !important;
}

/* The E M A C S subtitle should also stay neutral, not blue/purple. */
.tc-modal.is-dashboard-preview .tc-dashboard-emacs,
.tc-modal.is-dashboard-preview .tc-dashboard-emacs * {
  color: var(--tc-fg-alt, var(--tc-comment, #a6adc8)) !important;
  opacity: 0.84 !important;
  font-style: normal !important;
}

/* Only actual dashboard menu rows use link/keybinding colours. */
.tc-modal.is-dashboard-preview .tc-dashboard-menu .tc-dashboard-icon,
.tc-modal.is-dashboard-preview .tc-dashboard-menu .tc-dashboard-label {
  color: var(--tc-link, var(--tc-function, #89b4fa)) !important;
}

.tc-modal.is-dashboard-preview .tc-dashboard-menu .tc-dashboard-key {
  color: var(--tc-keyword, #cba6f7) !important;
}
`;
  }

  let timer = 0;

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      requestAnimationFrame(ensureStyle);
    }, 20);
  }

  const originalOpen = window.themeCreatorOpen;

  if (typeof originalOpen === "function" && !originalOpen.__dashboardLogoColourV108) {
    const wrapped = function themeCreatorOpenV108(...args) {
      const result = originalOpen.apply(this, args);
      setTimeout(schedule, 80);
      setTimeout(schedule, 250);
      return result;
    };

    wrapped.__dashboardLogoColourV108 = true;
    window.themeCreatorOpen = wrapped;
  }

  document.addEventListener("click", (event) => {
    if (!event.target.closest || !event.target.closest(".tc-modal")) return;

    if (event.target.closest(".tc-preview-tab,.tc-centaur-nav")) {
      setTimeout(schedule, 40);
      setTimeout(schedule, 180);
    }
  }, true);

  document.addEventListener("input", (event) => {
    if (!event.target.closest || !event.target.closest(".tc-modal")) return;

    if (event.target.matches('input[type="color"],[data-tc-colour],[data-tc-color]')) {
      schedule();
    }
  }, true);

  document.addEventListener("change", (event) => {
    if (!event.target.closest || !event.target.closest(".tc-modal")) return;

    if (event.target.matches('input[type="color"],[data-tc-colour],[data-tc-color]')) {
      schedule();
    }
  }, true);

  window.themeCreatorApplyDashboardLogoColour = ensureStyle;

  setTimeout(schedule, 120);
})();



// Theme Creator v110: live Doom Dashboard colour mapping.
// Dashboard rendering only. No layout, spacing, or structure changes.
(() => {
  if (window.__themeCreatorDashboardLiveColoursV110) return;
  window.__themeCreatorDashboardLiveColoursV110 = true;

  const STYLE_ID = "theme-creator-dashboard-live-colours-v110";

  function normalise(text) {
    return String(text || "")
      .replace(/#[0-9a-fA-F]{3,8}/g, "")
      .replace(/\bcurrent value\b/gi, "")
      .replace(/\bcolou?r\b/gi, "")
      .replace(/[^a-zA-Z0-9]+/g, " ")
      .trim()
      .toLowerCase();
  }

  function hexFrom(value) {
    const raw = String(value || "");
    const hex = raw.match(/#[0-9a-fA-F]{6}\b/);
    if (hex) return hex[0];

    const rgb = raw.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (!rgb) return "";

    return "#" + [rgb[1], rgb[2], rgb[3]]
      .map((n) => Math.max(0, Math.min(255, Number(n))).toString(16).padStart(2, "0"))
      .join("");
  }

  function safeCss(value, fallback) {
    return String(value || fallback || "").replace(/[^#a-zA-Z0-9(),.%\s-]/g, "");
  }

  function colourControls(modal) {
    if (!modal) return [];

    return [...modal.querySelectorAll(`
      .tc-colour-grid input[type="color"],
      .tc-color-grid input[type="color"],
      .tc-colours-grid input[type="color"],
      .tc-colour-roles input[type="color"],
      .tc-colour-grid [data-tc-colour],
      .tc-colour-grid [data-tc-color],
      .tc-color-grid [data-tc-colour],
      .tc-color-grid [data-tc-color],
      .tc-colours-grid [data-tc-colour],
      .tc-colours-grid [data-tc-color],
      .tc-colour-roles [data-tc-colour],
      .tc-colour-roles [data-tc-color]
    `)];
  }

  function controlValue(control) {
    return hexFrom(
      control.value ||
      control.getAttribute("data-value") ||
      control.getAttribute("aria-valuetext") ||
      control.style.backgroundColor ||
      ""
    );
  }

  function controlText(control) {
    const row = control.closest(
      ".tc-colour-row,.tc-color-row,.tc-colour-field,.tc-color-field,.tc-colour-item,.tc-color-item"
    );
    const label = row && row.querySelector("label,.tc-colour-label,.tc-color-label");

    return normalise([
      control.dataset && control.dataset.tcColour,
      control.dataset && control.dataset.tcColor,
      control.dataset && control.dataset.colour,
      control.dataset && control.dataset.color,
      control.dataset && control.dataset.role,
      control.dataset && control.dataset.key,
      control.getAttribute("name"),
      control.getAttribute("id"),
      control.getAttribute("aria-label"),
      control.getAttribute("title"),
      label && label.textContent,
      row && row.textContent
    ].filter(Boolean).join(" "));
  }

  function roleFor(control) {
    const key = String(
      (control.dataset && (control.dataset.tcColor || control.dataset.tcColour || control.dataset.role || control.dataset.key)) ||
      control.getAttribute("name") ||
      control.getAttribute("id") ||
      ""
    ).trim();

    const direct = {
      bg: "bg",
      bgAlt: "bgAlt",
      fg: "fg",
      fgAlt: "fgAlt",
      comments: "comment",
      keywords: "keyword",
      functions: "function",
      links: "link",
      accent: "accent",
    };

    if (Object.prototype.hasOwnProperty.call(direct, key)) return direct[key];

    const text = controlText(control);

    if (/\balt\b/.test(text) && /\bbackground\b/.test(text)) return "bgAlt";
    if (/\bbackground\b/.test(text)) return "bg";

    if (/\bdim\b/.test(text) && /\bforeground\b/.test(text)) return "fgAlt";
    if (/\bforeground\b/.test(text)) return "fg";

    if (/\bcomment|comments\b/.test(text)) return "comment";
    if (/\bkeyword|keywords\b/.test(text)) return "keyword";
    if (/\bfunction|functions\b/.test(text)) return "function";
    if (/\blink|links\b/.test(text)) return "link";
    if (/\bsuccess\b/.test(text)) return "success";
    if (/\baccent\b/.test(text)) return "accent";

    return "";
  }

  function collectDashboardColours(modal) {
    const out = {};

    for (const control of colourControls(modal)) {
      const role = roleFor(control);
      const value = controlValue(control);

      if (role && value) {
        out[role] = value;
      }
    }

    return {
      bg: out.bg || "#11111b",
      bgAlt: out.bgAlt || "#181825",
      fg: out.fg || "#cdd6f4",
      fgAlt: out.fgAlt || out.comment || "#a6adc8",
      comment: out.comment || "#7f849c",
      keyword: out.keyword || "#cba6f7",
      function: out.function || out.link || out.accent || "#89b4fa",
      link: out.link || out.function || out.accent || "#89b4fa",
      success: out.success || out.accent || "#a6e3a1"
    };
  }

  function writeDashboardColourStyle(colours) {
    let style = document.getElementById(STYLE_ID);

    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }

    const bg = safeCss(colours.bg);
    const bgAlt = safeCss(colours.bgAlt);
    const fg = safeCss(colours.fg);
    const fgAlt = safeCss(colours.fgAlt);
    const comment = safeCss(colours.comment);
    const keyword = safeCss(colours.keyword);
    const link = safeCss(colours.link);
    const fn = safeCss(colours.function);
    const success = safeCss(colours.success);

    style.textContent = `
/* generated by Theme Creator v110 */

/* Scope dashboard palette variables to the modal. */
.tc-modal.is-dashboard-preview {
  --tc-dashboard-bg: ${bg} !important;
  --tc-dashboard-bg-alt: ${bgAlt} !important;
  --tc-dashboard-fg: ${fg} !important;
  --tc-dashboard-fg-alt: ${fgAlt} !important;
  --tc-dashboard-comment: ${comment} !important;
  --tc-dashboard-keyword: ${keyword} !important;
  --tc-dashboard-function: ${fn} !important;
  --tc-dashboard-link: ${link} !important;
  --tc-dashboard-success: ${success} !important;
}

/* Dashboard background follows Background / Alt background. */
.tc-modal.is-dashboard-preview .tc-pane:first-child,
.tc-modal.is-dashboard-preview [data-tc-pane-right],
.tc-modal.tc-dashboard-single-window-v218 [data-tc-pane-right] {
  background:
    radial-gradient(circle at 50% 42%, color-mix(in srgb, ${bgAlt} 68%, transparent), transparent 37%),
    linear-gradient(180deg, color-mix(in srgb, ${bg} 92%, #ffffff 8%), ${bg}) !important;
}

.tc-modal.is-dashboard-preview .tc-code,
.tc-modal.is-dashboard-preview .tc-dashboard-pre,
.tc-modal.is-dashboard-preview .tc-dashboard-line {
  color: ${fg} !important;
}

/* ASCII logo: Comments, with a small amount of Foreground mixed in. */
.tc-modal.is-dashboard-preview .tc-dashboard-logo,
.tc-modal.is-dashboard-preview .tc-dashboard-logo * {
  color: color-mix(in srgb, ${comment} 76%, ${fg} 24%) !important;
  opacity: 0.88 !important;
  font-style: normal !important;
}

/* E M A C S subtitle: Dim foreground, falling back through Comments. */
.tc-modal.is-dashboard-preview .tc-dashboard-emacs,
.tc-modal.is-dashboard-preview .tc-dashboard-emacs * {
  color: ${fgAlt} !important;
  opacity: 0.84 !important;
  font-style: normal !important;
}

/* Menu icons and labels: Link if present, otherwise Functions/Accent fallback. */
.tc-modal.is-dashboard-preview .tc-dashboard-menu .tc-dashboard-icon,
.tc-modal.is-dashboard-preview .tc-dashboard-menu .tc-dashboard-label {
  color: ${link} !important;
}

/* Keybindings: Keywords. */
.tc-modal.is-dashboard-preview .tc-dashboard-menu .tc-dashboard-key {
  color: ${keyword} !important;
}

/* Status: Comments. */
.tc-modal.is-dashboard-preview .tc-dashboard-status,
.tc-modal.is-dashboard-preview .tc-dashboard-status * {
  color: ${comment} !important;
  font-style: italic !important;
  opacity: 0.9 !important;
}

/* Bottom icon/category: Success if present, otherwise Accent fallback. */
.tc-modal.is-dashboard-preview .tc-dashboard-cat,
.tc-modal.is-dashboard-preview .tc-dashboard-cat * {
  color: ${success} !important;
}
`;
  }

  function applyDashboardLiveColours() {
    const modal = document.querySelector(".tc-modal");
    if (!modal) return;

    const colours = collectDashboardColours(modal);
    writeDashboardColourStyle(colours);
  }

  let timer = 0;

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      requestAnimationFrame(() => {
        applyDashboardLiveColours();
        requestAnimationFrame(applyDashboardLiveColours);
      });
    }, 20);
  }

  const originalOpen = window.themeCreatorOpen;

  if (typeof originalOpen === "function" && !originalOpen.__dashboardLiveColoursV110) {
    const wrapped = function themeCreatorOpenV110(...args) {
      const result = originalOpen.apply(this, args);
      setTimeout(schedule, 80);
      setTimeout(schedule, 250);
      return result;
    };

    wrapped.__dashboardLiveColoursV110 = true;
    window.themeCreatorOpen = wrapped;
  }

  document.addEventListener("click", (event) => {
    if (!event.target.closest || !event.target.closest(".tc-modal")) return;

    if (event.target.closest(".tc-preview-tab,.tc-centaur-nav")) {
      setTimeout(schedule, 40);
      setTimeout(schedule, 180);
    }
  }, true);

  document.addEventListener("input", (event) => {
    if (!event.target.closest || !event.target.closest(".tc-modal")) return;

    if (event.target.matches('input[type="color"],[data-tc-colour],[data-tc-color]')) {
      schedule();
    }
  }, true);

  document.addEventListener("change", (event) => {
    if (!event.target.closest || !event.target.closest(".tc-modal")) return;

    if (event.target.matches('input[type="color"],[data-tc-colour],[data-tc-color]')) {
      schedule();
    }
  }, true);

  window.themeCreatorApplyDashboardLiveColours = applyDashboardLiveColours;

  setTimeout(schedule, 120);
})();

/* Theme Creator v112: path-token endpoint transport fix.
   Save/Preview/Install send base64url JSON as the servlet path payload:
   /my-theme-creator-preview/<token>
*/

/* Theme Creator v113: backend-safe theme name normalisation.
   Preview/Save/Install now normalise draft.name to:
   ^[a-z][a-z0-9-]*$
   before encoding the payload for the local Emacs backend. */


// Theme Creator v115: refresh preview/tab colours after Reset.
// Frontend only. No layout changes.
(() => {
  if (window.__themeCreatorResetRefreshV115) return;
  window.__themeCreatorResetRefreshV115 = true;

  function modalFrom(target) {
    return target && target.closest && target.closest(".tc-modal");
  }

  function isResetControl(target) {
    const control = target && target.closest &&
      target.closest('button,[role="button"],input[type="button"],input[type="submit"],.tc-button');

    if (!control) return false;

    const text = String(
      control.textContent ||
      control.value ||
      control.getAttribute("aria-label") ||
      control.getAttribute("title") ||
      ""
    ).trim().toLowerCase();

    const action = String(
      control.getAttribute("data-action") ||
      control.getAttribute("data-tc-action") ||
      control.getAttribute("data-role") ||
      ""
    ).trim().toLowerCase();

    return text === "reset" ||
           text.includes("reset") ||
           action === "reset" ||
           action.includes("reset");
  }

  function colourControls(modal) {
    if (!modal) return [];

    return [...modal.querySelectorAll(`
      input[type="color"],
      [data-tc-colour],
      [data-tc-color],
      [data-colour-role],
      [data-color-role]
    `)];
  }

  function dispatchColourEvents(modal) {
    for (const control of colourControls(modal)) {
      try {
        control.dispatchEvent(new Event("input", { bubbles: true }));
        control.dispatchEvent(new Event("change", { bubbles: true }));
      } catch (_) {
        /* ignored */
      }
    }
  }

  function callRefreshHooks() {
    const hooks = [
      "themeCreatorRebuild",
      "themeCreatorRenderDashboardBlock",
      "themeCreatorApplyDashboardLiveColours",
      "themeCreatorApplyDashboardLogoColour",
      "themeCreatorApplyDashboardSpacing",
      "themeCreatorApplyDashboardTabStyles",
      "themeCreatorRefreshPreviewColours",
      "themeCreatorRefreshTabColours"
    ];

    for (const name of hooks) {
      const fn = window[name];

      if (typeof fn === "function") {
        try {
          fn();
        } catch (_) {
          /* ignored */
        }
      }
    }
  }

  function refreshAfterReset(modal) {
    dispatchColourEvents(modal);
    callRefreshHooks();

    try {
      document.dispatchEvent(new CustomEvent("themecreator:palette-reset", {
        bubbles: true,
        detail: { source: "v115-reset-refresh" }
      }));
    } catch (_) {
      /* ignored */
    }
  }

  function scheduleResetRefresh(modal) {
    for (const delay of [0, 30, 90, 180, 360]) {
      setTimeout(() => {
        requestAnimationFrame(() => refreshAfterReset(modal));
      }, delay);
    }
  }

  document.addEventListener("click", (event) => {
    if (!isResetControl(event.target)) return;

    const modal = modalFrom(event.target);
    if (!modal) return;

    scheduleResetRefresh(modal);
  }, true);

  document.addEventListener("reset", (event) => {
    const modal = modalFrom(event.target);
    if (!modal) return;

    scheduleResetRefresh(modal);
  }, true);

  window.themeCreatorRefreshAfterReset = () => {
    scheduleResetRefresh(document.querySelector(".tc-modal"));
  };
})();

/* Theme Creator v126: endpoint payload reads live colour controls.
   Preview/Save/Install now merge the current colour inputs into payload.palette
   immediately before base64url encoding the backend request. */

/* Theme Creator v211 categorised colour editor repair begin */
(function themeCreatorCategorisedColourEditorRepairV211() {
  function escapeAttr(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function sections() {
    return typeof window.themeCreatorColourSectionsV211 === "function"
      ? window.themeCreatorColourSectionsV211()
      : [];
  }

  function fallbacks() {
    return typeof window.themeCreatorPaletteFallbackV211 === "function"
      ? window.themeCreatorPaletteFallbackV211()
      : {};
  }

  function currentValues(scope) {
    const values = {};
    scope.querySelectorAll("[data-tc-color]").forEach((input) => {
      const key = input.getAttribute("data-tc-color");
      if (key && input.value) values[key] = input.value;
    });
    return values;
  }

  function expectedKeys() {
    return sections().flatMap((section) => section.roles.map(([key]) => key));
  }

  function gridNeedsRepair(grid) {
    if (!grid) return false;

    const hasSourceCategories = !!grid.querySelector(".tc-colour-category-title");
    const missingKeys = expectedKeys().some((key) => !grid.querySelector(`[data-tc-color="${CSS.escape(key)}"]`));

    if (hasSourceCategories && !missingKeys) return false;
    if (!grid.querySelector(".tc-colour-heading-v146")) return true;

    return missingKeys;
  }

  function renderGrid(grid) {
    const scope = grid.closest(".tc-modal") || document;
    const values = currentValues(scope);
    const fallback = fallbacks();

    grid.innerHTML = sections().map((section) => `
      <section class="tc-colour-section-v146 tc-colour-section-v211" data-tc-colour-section-v211="${escapeAttr(section.title)}">
        <h3 class="tc-colour-heading-v146 tc-colour-heading-v211">${escapeAttr(section.title)}</h3>
        <div class="tc-colour-section-grid-v211">
          ${section.roles.map(([key, label, roleFallback]) => {
            const value = values[key] || fallback[key] || roleFallback || "#89b4fa";

            return `
              <label class="tc-colour-card-v146 tc-colour-card-v211" data-tc-colour-card-v211="${escapeAttr(key)}">
                <span class="tc-colour-label-v146">${escapeAttr(label)}</span>
                <span class="tc-colour-hex-v146" data-tc-colour-hex-v211="${escapeAttr(key)}">${escapeAttr(String(value).toUpperCase())}</span>
                <input
                  type="color"
                  data-tc-color="${escapeAttr(key)}"
                  data-v146-generated="true"
                  value="${escapeAttr(value)}"
                  aria-label="${escapeAttr(label)}"
                  title="${escapeAttr(label)}">
              </label>
            `;
          }).join("")}
        </div>
      </section>
    `).join("");
  }

  function ensure(root = document) {
    const scope = root && root.querySelector ? root : document;
    let changed = false;

    scope.querySelectorAll(".tc-colour-grid").forEach((grid) => {
      if (!gridNeedsRepair(grid)) return;
      renderGrid(grid);
      changed = true;
    });

    if (changed && typeof window.updatePreview === "function") {
      try {
        const modal = document.querySelector(".tc-modal:not([hidden])") || document.querySelector(".tc-modal");
        if (modal) window.updatePreview(modal);
      } catch (_) {}
    }

    return changed;
  }

  document.addEventListener("input", (event) => {
    const input = event.target && event.target.closest
      ? event.target.closest("[data-tc-color]")
      : null;

    if (!input) return;

    const key = input.getAttribute("data-tc-color");
    const scope = input.closest(".tc-modal") || document;
    scope.querySelectorAll([
      `[data-tc-colour-hex="${CSS.escape(key)}"]`,
      `[data-tc-colour-hex-v211="${CSS.escape(key)}"]`
    ].join(",")).forEach((hex) => {
      hex.textContent = String(input.value || "").toUpperCase();
    });
  }, true);

  function schedule(root = document) {
    requestAnimationFrame(() => ensure(root));
    setTimeout(() => ensure(root), 120);
    setTimeout(() => ensure(root), 400);
  }

  document.addEventListener("click", (event) => {
    if (event.target && event.target.closest("#theme-add-btn, .tc-modal, [data-tc-color]")) {
      schedule(document);
    }
  }, true);

  window.themeCreatorV211EnsureCategorisedColourEditor = ensure;
  window.themeCreatorV211ColourEditorState = function themeCreatorV211ColourEditorState() {
    const grid = document.querySelector(".tc-colour-grid");

    return {
      version: window.themeCreatorScriptVersion || null,
      hasGrid: !!grid,
      hasHeadings: !!(grid && grid.querySelector(".tc-colour-heading-v146")),
      expectedKeys: expectedKeys(),
      presentKeys: grid
        ? [...grid.querySelectorAll("[data-tc-color]")].map((input) => input.getAttribute("data-tc-color"))
        : [],
    };
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => schedule(document), { once: true });
  } else {
    schedule(document);
  }
})();
/* Theme Creator v211 categorised colour editor repair end */

/* Theme Creator v212 compact transparency panel begin */
(function themeCreatorCompactTransparencyPanelV212() {
  function rootFor(node) {
    if (node && node.closest) return node.closest(".tc-modal") || document;
    if (node && node.querySelector) return node;
    return document;
  }

  function clampAlpha(value) {
    const n = Number.parseInt(value, 10);
    if (Number.isNaN(n)) return 100;
    return Math.max(0, Math.min(100, n));
  }

  function hexToRgb(hex) {
    const match = String(hex || "").trim().match(/^#?([0-9a-fA-F]{6})$/);
    if (!match) return null;

    const v = match[1];
    return {
      r: Number.parseInt(v.slice(0, 2), 16),
      g: Number.parseInt(v.slice(2, 4), 16),
      b: Number.parseInt(v.slice(4, 6), 16),
    };
  }

  function rgba(hex, alpha) {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex || "#11111b";
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha / 100})`;
  }

  function currentBackground(scope) {
    const input = scope.querySelector('[data-tc-color="bg"]');
    if (input && input.value) return input.value;

    try {
      const cssBg = getComputedStyle(scope).getPropertyValue("--tc-bg").trim();
      if (cssBg) return cssBg;
    } catch (_) {}

    return "#11111b";
  }

  function currentAlpha(scope) {
    const slider = scope.querySelector("[data-tc-transparency]");
    return clampAlpha(slider && slider.value);
  }

  function removeTransparencyNoise(scope) {
    scope.querySelectorAll("[data-tc-transparency-output]").forEach((node) => {
      node.remove();
    });

    scope.querySelectorAll("[data-tc-transparency-number]").forEach((node) => {
      node.remove();
    });

    scope.querySelectorAll("[data-tc-transparency-status]").forEach((node) => {
      node.remove();
    });

    scope.querySelectorAll("small").forEach((node) => {
      if (/0\s*transparent|100\s*opaque|preview background alpha/i.test(node.textContent || "")) {
        node.remove();
      }
    });

    [...scope.querySelectorAll("*")].forEach((node) => {
      if (!node.children.length &&
          /^(?:100%|0\s*transparent|100\s*opaque|Preview background alpha\s*\d+%)$/i.test((node.textContent || "").trim())) {
        node.remove();
      }
    });
  }

  function updateSwatch(scope) {
    const slider = scope.querySelector("[data-tc-transparency]");
    const swatch =
      scope.querySelector("[data-tc-transparency-swatch]") ||
      scope.querySelector("[data-tc-transparency-swatch-v212]");
    if (!slider || !swatch) return;

    const alpha = currentAlpha(scope);
    const bg = currentBackground(scope);
    const fill =
      swatch.querySelector(".tc-transparency-swatch-fill") ||
      swatch.querySelector("i") ||
      swatch.firstElementChild;

    if (fill && fill.style) {
      fill.style.backgroundColor = bg;
      fill.style.opacity = String(alpha / 100);
    } else {
      swatch.style.backgroundColor = rgba(bg, alpha);
    }

    swatch.title = `Preview background alpha ${alpha}%`;
    swatch.setAttribute("aria-label", `Preview background alpha ${alpha}%`);
  }

  function ensure(root = document) {
    const scope = rootFor(root);

    removeTransparencyNoise(scope);

    scope.querySelectorAll("[data-tc-transparency]").forEach((slider) => {
      const row =
        slider.closest(".tc-transparency-row") ||
        slider.closest("label") ||
        slider.parentElement;

      if (!row) return;

      row.classList.add("tc-transparency-row-v212");

      const swatch =
        row.querySelector("[data-tc-transparency-swatch]") ||
        row.querySelector("[data-tc-transparency-swatch-v212]");

      row.querySelectorAll("[data-tc-transparency-swatch], [data-tc-transparency-swatch-v212]").forEach((node) => {
        if (node !== swatch) node.remove();
      });

      updateSwatch(scope);
    });
  }

  document.addEventListener("input", (event) => {
    const target = event.target;

    if (!target || !target.matches) return;

    if (target.matches("[data-tc-transparency], [data-tc-color='bg']")) {
      const scope = rootFor(target);
      requestAnimationFrame(() => ensure(scope));
    }
  }, true);

  document.addEventListener("click", (event) => {
    if (event.target && event.target.closest &&
        event.target.closest("#theme-add-btn, .tc-modal, [data-tc-preview-tab]")) {
      setTimeout(() => ensure(document), 80);
      setTimeout(() => ensure(document), 260);
    }
  }, true);

  window.themeCreatorV212EnsureCompactTransparency = ensure;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => ensure(document), { once: true });
  } else {
    ensure(document);
  }
})();
/* Theme Creator v212 compact transparency panel end */

/* Theme Creator v212 dashboard auto fetch export begin */
(function themeCreatorDashboardAutoFetchExportV212() {
  try {
    if (typeof fetchLiveDashboard === "function") {
      window.themeCreatorFetchLiveDashboard = fetchLiveDashboard;
    }
  } catch (_) {}

  window.themeCreatorV212DashboardState = function themeCreatorV212DashboardState() {
    return {
      activePreview: typeof activePreview !== "undefined" ? activePreview : null,
      loading: !!window.themeCreatorLiveDashboardLoading,
      error: window.themeCreatorLiveDashboardError || null,
      lines: Array.isArray(window.themeCreatorLiveDashboardLines)
        ? window.themeCreatorLiveDashboardLines.length
        : null,
      fetcher: typeof window.themeCreatorFetchLiveDashboard,
    };
  };
})();
/* Theme Creator v212 dashboard auto fetch export end */









