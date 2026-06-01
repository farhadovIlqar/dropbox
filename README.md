# Welcome to My Backend Dropbox

**🔗 Live Demo URL:** [https://d3868cqekf80wg.cloudfront.net](https://d3868cqekf80wg.cloudfront.net) 

***

## Task
The main problem was to build a fully functional, secure, and user-friendly Dropbox-like cloud storage system from scratch. The primary challenges included implementing secure user authentication, simulating a nested folder system within a flat object storage service, handling file uploads/deletions, maintaining file version history, and generating time-limited encrypted shareable links.

## Description
We solved this problem by leveraging the AWS ecosystem (AWS Amplify, Cognito, and S3) alongside a modern React.js frontend:
- **Authentication:** Integrated AWS Cognito to handle secure user registration, login, and session management.
- **File & Folder Management:** Utilized Amazon S3 for scalable file storage. We implemented a virtual folder architecture by managing S3 object prefixes and creating empty `.keep` files to simulate directories.
- **Secure Sharing:** Leveraged S3 pre-signed URLs to generate encrypted, shareable links that automatically expire after 1 hour.
- **User Interface:** Developed a responsive and premium dashboard using React (Vite) and Vanilla CSS, featuring breadcrumb navigation, interactive icons, and real-time storage feedback.

## Installation
To set up and run this project locally, ensure you have Node.js installed and an AWS account configured.

```bash
# 1. Clone the repository
git clone <your-repository-url>

# 2. Navigate into the project directory
cd my_dropbox

# 3. Install NPM dependencies
npm install

# 4. Pull and configure the AWS Amplify backend
amplify pull
# (or setup manually using: amplify init, amplify add auth, amplify add storage, amplify push)

# 5. Start the local development server
npm run dev
```

## Usage
How to interact with the application:
1. Open the application URL in your web browser.
2. Create a new account or Sign In using the secure authentication portal.
3. Click **"New Folder"** to create directories and organize your workspace.
4. Click **"Upload File"** to securely upload documents, images, or any file types to the current folder.
5. Navigate through your folders using the interactive **Breadcrumb Navigation** at the top.
6. Click the **"Share"** icon next to any file to instantly copy a 1-hour expiring public link to your clipboard.
7. Click the **"Delete"** icon to permanently remove files from the cloud.

### The Core Team


<span><i>Made at <a href='https://qwasar.io'>Qwasar SV -- Software Engineering School</a></i></span>
<span><img alt='Qwasar SV -- Software Engineering School's Logo' src='https://storage.googleapis.com/qwasar-public/qwasar-logo_50x50.png' width='20px' /></span>