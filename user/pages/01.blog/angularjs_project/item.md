---
title: Building a web application with AngularJS - Part 1
date: 16:49 11/07/2016 
highlight:
    theme: monokai
taxonomy:
    category: blog
    tag: [angular, web development, project, workflow]
---
    
AngularJS is something I've been wanting to try out for a very long time. Thankfully, college offered me the golden opportunity in the form of a group project. Here's my take on how the project's going and what I've gotten done so far.

<!-- ![knight](knight.svg) -->

<svg preserveAspectRatio="xMinYMin meet" class="svg-content" viewBox="0 0 620 300" id="angularjs_project"></svg>
<script type="text/javascript" src="/user/pages/01.blog/angularjs_project/angularjs_project.js"></script>
<br>

===

!!!! Update: The project is finally finished and you can access the completed application [here](https://cs353-project.firebaseapp.com/#/login) or even check out the entire codebase [here](https://github.com/gregorykelleher/MuHub_Angular_App).

### The Idea

The aim of the project was to design and build a web application that would serve the needs of a particular demographic in society. Being students, we found it easiest to recognise the issues that confront us as university students. Therefore we decided to brainstorm ideas that maybe could improve life on the college campus.

We quickly set upon the matter of campus mapping and the sometimes poor and erratic layout of the campus. This was especially inconvenient around exam time when the university held exams dotted in obscure and remote locations. To make matters worse, the exam timetable provided by the university would typically only show the room code and nothing more, as if exams weren't stressful enough.

It soon became apparent to us that we wanted to design and build a tool for identifying rooms and locations on campus. In fact, there was a similar online tool previously offered by the university which did much the same, but for some unknown reason it was taken off-line abruptly. Despite having a poor UI, it certainly found its use during the exam period and was widely used by students. Hopefully, we thought we could make something that would better it. 

Therefore with the main aim of the project determined, we decided to broaden the scope of the application and think about including other features that students could benefit from in the long run.

For instance, we decided we wanted to integrate a Google maps service into the interface for pinpointing the locations directly onto a map. Being able to quickly visualise the location would be of great advantage to the end user.

Not only that, but we also desired to upgrade the application from being a primitive _campus locator_ to something of real value that would further increase user engagement.

For that reason, we also set about designing a dashboard panel that would provide real-time services and tools that the user could use in parallel. A timetable and messaging service were both purposed, as well as smaller components such as a weather widget and a to-do list.

![prototype_2.svg](prototype_2.svg)

Lastly, for the purposes of the project's preconditions we were required to restrict access only to authenticated university students. This meant that we also had to perform work on building a strong back-end to the project where we would manage user data.

So with some basic framework to the project and plenty of ideas floating about, work could soon begin. But first and most importantly we needed to decide and agree upon a work-flow for the project.

### Project Work-Flow

When it comes down to it, having the optimal work-flow can make or break a project. Having five more members on the team meant that careful planning and organisation were critical to the project's success.

!!! I thought I'd take a moment here to mention **Slack** which we used extensively for team communication. It served its purpose well and what's more, everyone on the team was prepared to use it without hesitation. Overall, I think I was most impressed by the great integration it had with other web services such as Github, and how we could get notifications on commits and pushes from our upstream repository.

With documentation handled using Google Drive and communication dealt with Slack, the last and foremost decision was our method of version control for the project's code-base. Without a shadow of a doubt, **Git** would be the only system we would use, and with good reason.

### Using Git

I made Git my responsibility for the project. I felt I best understood how we could properly implement a work-flow that could work for everyone. That said, I had never lead a group on a distributed project such as this, but at the same time I welcomed the challenge.

Understanding that other members of the team mightn't have the same experience with Git as I had, code _inviolability_ was my main priority. 

On account of this, I wanted to remove the need for team members in pushing to a central repository. The reason being is that it would remove the possibility of any misguided pushes and preserve the sanctity of the official code-base. Nominating myself as the _project maintainer_, only I could accept commits and integrate contributions, i.e. only I had write access to the official repository.

I hoped this work-flow would result in a flexible means for our team to collaborate securely with a minimum of risk.

The next step in implementing this idea, was having each team member own a fork of the official code-base (otherwise known as **upstream**). This would allow each team member have their own server-side repository which would serve as their own personal public repository. 

!!!! The forked repository is simply a direct copy of upstream but the difference being that only the team member that owns the fork has push access.

From there, each team member can simply clone their forked repositories and have their own isolated development environment. 

Using this work-flow I could ensure the privacy and self-ownership of each member's code while still allowing me to pull from their work. Also as the project maintainer it was my responsibility in accepting each member's contributions when a pull request to upstream would be filed. 

The ability to pull the contribution into my local repository meant that I could easily validate their code and merge it into my master branch, before making the push to the upstream repository. After the update to upstream had been made, then the rest of the team could pull to synchronise their local repositories.

![repo](repo.svg)

For the most part this method served us well, but as anyone knows with Git it can always get a little convoluted, as practice proved. Nevertheless, we stuck with our work-flow and after some initial teething problems, we soon picked up speed. 

Lastly, before leaving the topic of Git, it's worth mentioning how we used it for better maintainability of our code-base. One such method was `git rebase`. With such a large group of people working on the project simultaneously it was just as important to keep the project history unpolluted.

The solution of using git rebase meant that we could re-write and control our project's history, cleaning up unnecessary commits and maintaining a linear code progression. Personally, I had a preference for `git rebase -i` or _interactive rebasing_ which gives you the opportunity to alter your commits before merging in your branch. Especially since I tend to have a messy history at the best of times.

### Maintaining Dependencies

Something that cannot be overlooked is the matter of managing the medley of dependencies the project grows to rely upon. Particularly when using such a complex framework such as AngularJS.

I decided upon using **NPM** to resolve the installation and maintenance of our package dependencies. Writing a `package.json` file and putting it in the root of our project, other group members could easily install everything with something as simple as `npm install` and then NPM would go to work.

```bash
$ npm list
cs353_project@1.0.0 /Users/admin/Documents/CS353_project
├── angular@1.5.8
├── angular-animate@1.5.8
├── angular-aria@1.5.8
├── angular-material@1.1.1
├── angular-messages@1.5.8
├── angular-router@0.0.2
├── angularfire@2.0.2
└── firebase@3.4.1
```

! Note that this is a highly summarised view of our dependency list and it actually contains quite a few more packages!

Updating this list is just as easy as creating it, since it's only a matter of `npm install <pkg> --save` to include the installed package under the dependencies section of the `package.json` file.

Then to update everyone else on the recent addition to the `package.json` file, a `git push master` will update upstream and from there, everyone can sync to get the latest dependency list. Inside their local project all that's required is an `npm update` to install any recent inclusions. 

### Project Directory Structuring 

It should be apparent by now that it takes a lot of work just to get to this stage of the project! Between planning and setup, it takes quite a bit of effort in getting the environment ready for full development.

Directory structuring is critical when building something that could bloat to something quite sophisticated. And proper separation with AngularJS simplifies things immensely and improves understanding for everyone.

Of course, like anyone I went and researched best practices and tried to get an idea of how others were building their applications. I could have done trial and error (like I usually do) but it wouldn't hurt to learn a few basic principles before I got waist-deep in code.

Immediately I came across [angular-seed](https://github.com/angular/angular-seed) which is probably the easiest route I could have taken. It's an application skeleton for building any typical AngularJS web app and you can simply clone the seed into your working directory.

The reason I decided against using it was the fact that I didn't understand it well enough to have full confidence in building the application off the back of it. It's a complete boilerplate template that really contains much more than I needed or knew about and hence I thought I'd be best served in using it as a reference in building my own.

However, I did borrow a lot of good ideas from it and that much is apparent in our own directory structuring. 

In the end, the project directory structure isn't all that complex (or maybe I've just gotten better at understanding it) and it's relatively small. It looks something like what I have below:

```bash
CS353_project/
├── logs/                        : log files
├── public/                      : Common project folder
|   ├── app/                     : directory for angular web application
|   |   ├── controllers/         : angular controller directory
|   |   ├── directives/          : angular directives directory
|   |   ├── js/                  : JavaScript directory
|   |   ├── services/            : angular services directory
|   |   └── app.js               : application JavaScript file
|   ├── node_modules/            : dependencies installed via NPM 
|   │   ├── angular-animate/     : animation hooks
|   │   ├── angular-aria/        : accessibility 
|   │   ├── angular-messages/    : messages 
|   │   ├── angular-router/      : routing 
|   |   ├── angular-material/    : angular material theming & styling
|   |   ├── angularfire/         : angular bindings for firebase
|   │   └── firebase/            : firebase backend service
│   └── index.html               : main html page
├── .firebaserc                  : named alias definition for firebase CLI
├── .gitignore                   : git ignore file
├── database.rules.json          : firebase database rules
├── firebase.json                : firebase settings
└── package.json                 : NPM package file
└── README.md                    : project readme file
```

It's quite a standard setup for an AngularJS application but it suits the project fine. I realise its shortcomings and perhaps it's not the most scalable configuration, but it doesn't have to be any more complicated for our purposes.

Working down the tree is a very good way of explaining the project. At the very top is the `public` directory, which contains the project itself as well as other essential files such as the `package.json` I mentioned, the `firebase.json` and the `.gitignore`.

Inside `public` then is the `app` directory where the AngularJS functionality resides. The `node_modules` directory is generated by NPM and contains the installed dependencies I mentioned earlier. And then lastly is the `index.html` file which is foundation for the application.

### Conclusions

I realise I might be ending this post abruptly, but I'd rather get into more detail about AngularJS and Firebase in my next blog post. There's still a lot more to discuss about this project but it will have to wait just a little longer. Anyhow, I feel this gives enough of an introduction into how I approached the project from the onset and a general overview of the technologies we implemented.

So far things are on track and I'm satisfied with the project's progress. There's still much to be done but I've gained quite a bit of confidence over the last few weeks and I'm prepared to take my work a little further. I'm looking forward to following up this post in the near future.
