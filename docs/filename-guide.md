## Domain Structure
To register a subdomain, submit a pull request with a new JSON file in the `domains` directory. For example, to register `example.runonaws.dev`, create a file named `example.json` in `domains/`.

# Filename Guidelines
To register a nested subdomain such as `blog.example.runonaws.dev`, use dots (.) in the filename: `blog.example.json`.

Filename requirements:
- Must be alphanumeric and lowercase. Dashes (-) are allowed as separators, but not consecutively.
- Minimum 1 character, maximum 244 characters (excluding `.json`).
- Each label (segment between dots) must be ≤ 63 characters.
- File must end with `.json`.
- Must not contain `runonaws.dev`.
- Must not begin with a dot, or contain spaces or invalid characters.

#### Invalid Filenames
| Filename                | Issue                        |
|------------------------|------------------------------|
| .json                  | Empty filename               |
| A.json                 | Uppercase letters            |
| a..json                | Consecutive dots             |
| .a.json                | Starts with a dot            |
| a .json                | Contains a space             |
| a$.json                | Non-alphanumeric character   |
| a.json.json            | Multiple extensions          |
| a.runonaws.dev.json    | Contains reserved string     |
| a--a.json              | Consecutive dashes           |
| blog._a.json           | Label starts with underscore |
| abc123.aaa...aaa.json  | Label exceeds 63 characters  |
| very.long.filename...json | Filename exceeds 244 characters |

#### Valid Filenames
| Filename                  | Why It's Valid              |
|--------------------------|-----------------------------|
| a.json                   | Minimum 1 character         |
| example.json             | Lowercase and alphanumeric  |
| blog.example.json        | Nested subdomain            |
| my-blog.json             | Uses dashes correctly       |
| mail._domainkey.example.json | Underscore not in root label |
| _vercel.example.json     | Valid underscore usage      |
| abc123.json              | Alphanumeric                |

> Users may only register one single-letter subdomain to prevent domain squatting.