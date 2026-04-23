**Describe your process:**  
I used an iterative approach where I built each screen one by one instead of making the entire app at once so that I can make modifications as I go. This is because I had a very clear vision for the app using the Figma wireframes I created, so I wanted to keep iterating.

* Firstly, I went through the specification and followed the prompt log that served as a development log in the process. Since each prompt referred to some specific feature or screen, I could develop the feature or screen and validate the results before proceeding.  
* The major AI tool employed here was Claude and Claude Code workflow. I would alternate between the integration in the IDE and web interface when it came to writing the code itself or posing more abstract questions to the model..

**What AI tools and strategies did you use?** 

* I used Claude for bugs, ideation and prototyping suggestions  
* I used Figma to create the high fidelity prototypes  
* I used Claude Code extension for VS Code   
* I used ChatGPT also for bugs and ideation 

I used an agentic process like in HW8. But also, it was more of a human-AI collaboration where I used structured prompts but also kept correcting the issues that kept showing up. 

**Why those choices:**

* The app had a lot of stateful flows and reusable components, so breaking it into small, testable chunks reduced risk.  
* Using Figma/prototype-guided prompts ensured the UI matched the intended screens.  
* The iterative process helped catch mismatches early, like the auth wiring, navigation, and tutorial flow issues.

**What changed from a pre-113 approach:**  
In the past, I would have probably just put one single very detailed prompt in ChatGPT and told it to create an app just using that. Now, I have learnt to:

* Have very clear specifications   
* Use multiple prompts, which inspired my screen-by-screen approach   
* Reusing code that does similar things to speeden the process   
* Use Claude Code instead of ChatGPT, since it's clearly a more powerful tool that can also integrate with Figma  
* Verify navigation and data consistency regularly  
* I also find it easier to use AI as a tool rather than just a conversation companion  
* I would have never done the agentic build method, which has worked wonders for me

I feel this class has completely changed how I view vibe-coding and I feel much more well-equipped to create projects like this in a time constraint. Even getting such structured assignments and that’s been a great help. 

**With more time, I would:**

* Integrate Supabase authentication and database correctly  
* Add an actual backend using HPI server & SQL database   
* Implement Google Places and Unsplash API for location searching and photos  
* Implement proper database for storing profile information and votes  
* Implement push notifications and background synchronization  
* Improve accessibility and responsiveness of the UI

