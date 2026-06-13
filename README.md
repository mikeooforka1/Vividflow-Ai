# AI Video Clip Maker

This project is an AI-powered video clip maker that allows users to upload video files or links, processes the content to create clips, adds captions, and provides downloadable clips.

## Client-Side Overview

The client-side of the application is built using React. Below are the key components and pages:

- **App.jsx**: The main component that sets up the application structure and routing.
- **UploadForm.jsx**: A form for users to upload a video file or enter a video link.
- **ClipList.jsx**: Displays a list of generated video clips and allows users to download them.
- **CaptionEditor.jsx**: Allows users to edit captions for the generated clips.
- **Home.jsx**: The landing page containing the upload form and introductory content.
- **Download.jsx**: Displays downloadable clips and their captions.

## Installation

To set up the client-side of the application, follow these steps:

1. Navigate to the `client` directory:
   ```
   cd client
   ```

2. Install the dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

## API Integration

The client communicates with the backend server through the following utility:

- **api.js**: Contains functions for making API calls to handle video uploads, processing requests, and downloading clips.

## Usage

1. Upload a video file or enter a video link using the form on the home page.
2. After processing, view the generated clips and edit captions if necessary.
3. Download the processed clips from the download page.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License.