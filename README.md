# jira-weekly-report

Command-line tool for generating Jira weekly reports. Written in Javascript and runs in NodeJs environment.

Reports have the following format:

    1. Closed J1-123 / J1-300: "Introduce new module";
    2. Working on J1-123 / J1-301: "Server-side modifications";
    3. Resolved J1-124 / J1-302: "Update user manual";
    4. Started a code review for J1-124 / J1-303: "Unit tests creation and update";

# Usage

Set Jira host, username and password in .env file and run

    npm start

# License

MIT
