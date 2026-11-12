# Student Resource Hub

A student-friendly website for discovering useful learning resources by subject, difficulty, and format. It is designed to help students quickly find free materials for learning without needing to search across many websites.

## Why this project matters

Students often need a simple place to discover reliable resources when they are learning on their own. This project gives them a clean, searchable directory of learning materials for programming, math, science, design, and general study support.

## Features

- Search by keyword, topic, or subject
- Filter by subject, difficulty, and resource type
- Browse free, beginner-friendly learning resources
- Easy to expand with more resources over time
- No sign-in required
- Mobile-friendly, simple, and accessible design
- Static site with no build step or dependencies

## Project structure

```text
student-resource-hub/
├── index.html
├── styles.css
├── script.js
├── data/
│   └── resources.json
├── README.md
├── LICENSE
└── .gitignore
```

## Run locally

Because this is a static site, you can either:

1. Open `index.html` directly in a browser, or
2. Serve it locally with a Python server:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Add or improve resources

Edit `data/resources.json` to add new learning links and tags. Each item can include:

- title
- subject
- difficulty
- type
- description
- url
- tags

This makes the project easy to grow as your resource list expands.

## What this project shows

This project is a strong portfolio example because it solves a real student problem:

- finding useful learning materials
- organizing them in one place
- making study support easier to access

## Contributing

This project is good for small improvements such as:

- adding more resources
- improving design and layout
- improving accessibility
- adding favorites or sorting
- creating category pages

## License

MIT. See [LICENSE](LICENSE).
