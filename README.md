# Food Bank Recipe Organizer

This project is a Next.js application designed to help food banks organize and generate recipes based on available ingredients.

## Prerequisites

* Docker installed on your system.
* An OpenAI API key.

## Setup

1.  **Clone the repository:**

    ```bash
    git clone [your-repository-url]
    cd food-bank-recipe-organizer
    ```

2.  **Create a `.env.local` file:**

    * In the root of the project, create a file named `.env.local`.
    * Add your OpenAI API key to this file:

        ```
        OPENAI_API_KEY=your_actual_api_key
        ```

    * **Important:** Never commit this file to version control. Ensure it is included in your `.gitignore` file.

## Building the Docker Image

1.  **Build the Docker image with the OpenAI API key as a secret:**

    ```bash
    docker build --secret id=OPENAI_API_KEY,src=.env.local -t food-bank-recipe-app .
    ```

    * This command builds the Docker image and passes your API key as a Docker secret.
    * The `-t food-bank-recipe-app` tag names the image `food-bank-recipe-app`.
    * The `.` at the end specifies the build context (the current directory).

2.  **Run the Docker container:**

    ```bash
    docker run -p 3000:3000 food-bank-recipe-app
    ```

    * This command runs the Docker container and maps port 3000 of the container to port 3000 on your host machine.
    * You can then access the application in your browser at `http://localhost:3000`.

## Docker Compose (Optional)

If you prefer to use Docker Compose, run `docker-compose up --build` root of your project:

