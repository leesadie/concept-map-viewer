# Concept Map Viewer

Visualize a concept map from a `.json` file. Displays concepts as nodes, relationships as edges, and stores references or notes with a pop-up. Built with [d3.js](https://d3js.org/).

## Usage

### Run locally

Clone and run `index.html`

### View on web
Live demo: 

Use the **Load Concept Map** button to upload a `.json` file.

### JSON format
The `.json` file should be in the following format: 
```json
{
  "nodes": [
    { "id": "Concept A", "theme": "Theme1", "refs": ["Citation 1", "Citation 2"] },
    { "id": "Concept B", "theme": "Theme2", "refs": [] }
  ],
  "links": [
    { "source": "Concept A", "target": "Concept B" }
  ]
}
```