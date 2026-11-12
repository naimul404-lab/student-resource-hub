# Student Resource Hub

A small, student-friendly website for finding free learning resources by subject, difficulty, and format. The project is designed to help students discover useful resources quickly without needing accounts, subscriptions, or tracking.

## Why this project is useful

Students often need a simple place to discover high-quality learning resources. This project provides a clean, searchable directory of free materials for programming, math, science, and general learning.

## Features

- search by keyword, topic, or subject
- filter by subject, difficulty, and resource type
- browse free, beginner-friendly resources
- easy to expand with more resources in the future
- no sign-in required
- mobile-friendly, accessible layout
- static site with no build tool required

## Project structure

```text
student-resource-hub/
├── index.html
├── styles.css
├── script.js
├── data/
│   └── resources.json
├── README.md
└── LICENSE
```

## Run locally

Because this is a static site, you can either:

1. Open `index.html` directly in a browser, or
2. Serve it locally with a simple Python server:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Add more resources

Edit the JSON file in `data/resources.json` to add new learning links and tags. Each item should include:

- title
- subject
- difficulty
- type
- description
- url
- tags

## Contributing

This project is good for small improvements such as:

- adding more resources
- improving the design
- improving accessibility
- adding sorting and favorites
- creating category pages

## License

MIT. See [LICENSE](LICENSE).
