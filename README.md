# PantryEQ - Equal Access Meal Kits

## About the Project

**Inspiration and Vision**  
We united around a commitment to **social equity**, determined to create a real impact on food insecurity. From the outset, we knew that food banks needed a smarter way to turn unpredictable donations into nutritious, accessible meal kits that truly empower communities.

**Team Roles and Contributions**  
We defined clear roles from the start, allowing each of us to focus on our strengths:
- **David:** Led the ingredient integration, ensuring that our system accurately gathered and processed data from various sources.
- **Pierre:** Took charge of the AI recipe generation, developing innovative algorithms to create appetizing recipes from available pantry items.
- **Griffyn:** Bridged the gap between the raw ingredient data and AI-driven recipe generation, ensuring a seamless flow of information that resulted in coherent, practical meal kits.
- **UI (Myself):** Developed the landing page, designed the complete UI, created the graphics, and crafted the "About Us" page, bringing our project’s vision to life through compelling visual storytelling.

**Technical Journey and Challenges**  
Our path was filled with both breakthroughs and obstacles:
- **Database Evolution:** Initially, we faced significant issues with our database setup. We rapidly pivoted to a JSON-only storage solution, which streamlined our process and improved reliability.
- **API Integration:** Extracting data from the [Open Food Facts API](https://world.openfoodfacts.org) posed a major challenge. We had to devise robust methods to extract and utilize the necessary ingredient data effectively.
- **AI Integration:** Integrating AI for recipe generation required innovative thinking, as Pierre worked tirelessly to ensure that the technology could translate ingredient lists into creative and nutritious recipes.




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

