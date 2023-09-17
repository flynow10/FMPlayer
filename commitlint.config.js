const config = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "header-max-length": [2, "always", 72],
    "work-in-progress-rule": [2, "always"],
  },
  plugins: [
    {
      rules: {
        "work-in-progress-rule": (
          /** @type {{subject: string | undefined}} */ { subject }
        ) => {
          let valid = true;
          if (subject?.toLowerCase().includes("wip")) {
            valid = subject.endsWith("(wip)");
          }
          return [
            valid,
            "Work in progress notes should be put at the end, lowercase, and in parentheses",
          ];
        },
      },
    },
  ],
};

export default config;
