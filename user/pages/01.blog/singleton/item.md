---
title: A Minor Treatise on the Singleton Design Pattern
date: 15:46 08/4/2020
highlight:
    theme: monokai
taxonomy:
    category: blog
    tag: [Singleton, Design, Pattern, Programming]
---

It's a favourite past-time of critics to bash on the use of singletons, and that argument has merit. Frequent encounters have left an indelible mark on my psyche. This post is a continuation of an age old argument.

![singleton.svg](singleton.svg)

===

###What is a Singleton?

I reckon my first brush with a singleton was in some lacklustre lecture at college. Presumably duly-noted a few slides into a class on 'Software Design Patterns'. Docile and unremarkable then, singletons have returned with resentment.

Outside the confines of academia, singletons are frequently stumbled upon in the wild. Usually accompanied with a groan of despondency.

Alright, maybe a little melodramatic. On the surface singletons appear unassuming. Even convenient. To borrow the Wikipedia description,

> [...] The singleton pattern is a software design pattern that restricts the instantiation of a class to one 'single' instance

This trait is undeniably useful and applicable in many circumstances. Simple to implement, it would also explain their commonplace occurrence in embedded applications.

There are certain scenarios where a singleton can be the right answer. In a hypothetical system, only a single file manager is required. And perhaps in this example, a singleton is the best pattern to ensure only one instance of the file manager exists.

So to clarify, I'm not advocating against using singletons, moreso against their overuse. It's important to scrutinise their application, since so often their inherent drawbacks outweigh any benefit gained.

Whenever I find myself contemplating a singleton, it's usually a hint there's a better approach to discover.

To give a better description of a singleton in code, here's a dummy `QueueManager` singleton class:

```cpp
class QueueManager
{
public:
	static QueueManager& GetInstance()
	{
		static QueueManager instance;
		return instance;
	}

	void Send(int value);

	int Receive();

	QueueManager(const QueueManager&) = delete;
	QueueManager(const QueueManager&&) = delete;
	QueueManager& operator=(const QueueManager&) = delete;
	QueueManager& operator=(const QueueManager&&) = delete;

private:
	QueueManager(){};
	~QueueManager(){};
};
```

There's not an awful lot happening here, but it's a little slapdash (and I'll explain why soon).

In the class above, it's impossible to call the constructor because it's private. That's a feature not a bug. And it's in order to prevent direct calls with the `new` operator.

Instead, the user must use the defined `GetInstance()` method which returns the same single object to the client.

!! The `QueueManager` class has two responsiblities then: ensuring there's only one single instance _and_ managing a global access point to that instance. This is a violation of the [Single Responsibility Principle](https://en.wikipedia.org/wiki/Single-responsibility_principle)

Singletons must also suppress other operators, such as:

```cpp
QueueManager(const QueueManager&) = delete;				// copy ctor
QueueManager(const QueueManager&&) = delete;			// move ctor
QueueManager& operator=(const QueueManager&) = delete;	// copy assignment
QueueManager& operator=(const QueueManager&&) = delete;	// move assignment
```

That just about explains what a singleton is. It isn't difficult to understand or implement. However it lends a false sense of ease.

###Disadvantages

With the example singleton above, I'll highlight the shortcomings of the pattern and how it has potential to impact the codebase at large.

####Transparency and Coupling

Let's imagine you've been air-dropped into a new repository and you'd like to interact with a queue component. You find a `QueueInterface.h` file:

```cpp
// QueueInterface.h

#include "QueueManager.h"

// send data to queue
void send_data(int value);

// receive data from queue
int receive_data();
```

! Ignore the unusual architecture, it's an illustration of how an interface API could be designed to interact with the queue manager

`QueueInterface.h` declares the functions required to interact with the queue, and has a strict dependency on the `QueueManager` class. But this isn't explicitly stated.

Worse still, neither is it immediately obvious that there's a singleton lurking under the hood here.

Since `QueueManager` is defined as a singleton, the dependencies are inadventently hidden (i.e. not visible from function/constructor parameters).

An interface _should_ tell you _what_ it's interfacing, but the singleton pattern obscures this fact for the sake of convenience. Down the road, it's easy to imagine where singletons could be included unknowingly, in turn introducing runaway dependencies.

!!! With singletons, it's almost always a sacrifice of transparency for convenience.

We can assume too that `QueueInterface.h` is tightly coupled to the `QueueManager` singleton class. Diving into the `QueueInterface.cpp` implementation for the interface confirms this fact:

```cpp
// QueueInterface.cpp

#include "QueueInterface.h"

void send_data(int value)
{
	QueueManager& manager = QueueManager.GetInstance();
	manager.Send(value);
}

int receive_data()
{
	QueueManager& manager = QueueManager.GetInstance();
	return manager.Receive();
}
```

This coupling limits the modularity of the code; complicating extending the interface in the future.

If say, we wanted to overloaded with a new `double receive_data()` API function, we'd also need to modify the underlying `QueueManager` dependency to enable this change.

!! An extension of the interface shouldn't incur a modification of the implementation's behaviour. This is a direct violation of the [Open/Close Principle](https://en.wikipedia.org/wiki/Open%E2%80%93closed_principle).

Modifying a singleton is risky too, for the fact that it's a global object and could easily be surreptitiously included elsewhere (like previously mentioned).

In general, the aim should be to write extensible code instead. Especially when it comes to interfaces.

A good interface should be defined to have loose coupling and be independent of the implementation. This is what enables the underlying interfaced component to change, without causing knock-on effects down-stream.

####Testability

In my opinion this is the biggest drawback to singletons. They can prove incredibly difficult to unit test.

What if we added some new logic to our `receive_data()` function, how could we write a test case now?:

```cpp
int receive_data()
{
	QueueManager& manager = QueueManager.GetInstance();
	
	int received_data = manager.Receive();

	// new logic
	if (received_data % 2)
	{
		cout << "good" << endl;
		return receive_data;
	}

	return -1;
}
```

We want to test the `receive_data()` functionality in isolation of course. Meaning we don't want the singleton code to be exercised at all. Unfortunately because of the tight-coupling, if we were to try and write this test case, we'd invariably test the singleton as well.

What's worse is that singletons carry global state. In our unit tests then, we have to be cognisant that the global state of the singleton is preserved between every test case.

No more optimising by running all our unit tests in parallel because that's no longer feasible. And we also need to be mindful of how we order the test cases to avoid any spill-over effects.

A suggestion here might be to mock the singleton, but that runs up against its own challenges. The first hurdle being it's not possible to override a class static member function (i.e. `GetInstance()`).

Another major obstacle is the fact that a singleton can't be explicitly destructed. A singleton exists for the lifespan of the program, only ceasing to exist on termination.

Whilst it's fair to say that singletons aren't conducive to unit testing, there are a few techniques that can be tried.

For instance, a common solution would be extracting an interface to the singleton, and using that instead. That strategy usually revolves around using dependency injection. I argue that point later.

In all probability, dependency injection would've been a better choice for the implementation in the first place too.

I wouldn't recommend it, but it could also be possible to implement a special `singleton.ResetForTesting()` to reset the state of the singleton before the next test case.

To conclude on testability then, it's worth quoting the adage, _'Testability starts with the implementation'_. It's not _impossible_ to unit test singletons but it is gnarly. 

Hence my emphasis on scrutinising the choice of a singleton in the first place. Otherwise, you're left masochistically inflicting yourself for no good reason. 

####Thread Safety

When I mentioned earlier that the `QueueManager` implementation was 'slapdash', I was alluding to the lack of thread-safety. The singleton implementation uses lazy-initialisation, whereby the object is instantiated when the `GetInstance()` is first invoked:

```cpp
static QueueManager& GetInstance()
{
	static QueueManager instance; // <--- Instantiated on first use
	return instance;
}
```

If this singleton is run simultaneously in two threads, then the execution sequence creates two objects for the singleton. Which of course breaks the implementation.

I want to keep this section brief, but it's apparent that singletons aren't ideal for threading. Again possible, but requiring yet more modification to retrofit the class to ensure thread-safety.

###Proposed Alternatives

With all the disadvantages for singletons listed, I think it's only fair that I propose some alternatives.

As I see it, there are three main objectives for the `QueueInterface` interface and the `QueueManager` component:

+ Improve usability and remove ambiguity:
	- Enable the user to self-discover and use the Queue Interface
+ Improve testability:
	- Remove singleton design pattern, trim down code and enable mocking
+ Improve interface flexibility:
	- Decouple the interface from the implementation entirely to ensure a [separation of concerns](https://en.wikipedia.org/wiki/Separation_of_concerns)

#### Static Helper Function Interface

`QueueManager` is a relatively simple class. It isn't managing any state and is just wrapping a queue into a singleton. For that reason, there isn't a need for a full blown `QueueInterface` in the first place. 

To be pragmatic, the easiest solution might be just to remove the singleton and `QueueInterface`. Encapsulate any (statically defined) helper functions in an internal namespace within `QueueManager`. 

A public API could then be exposed to `QueueManager.h` to enable a client to interact with `QueueManager` that way.

#### Object-oriented Service-Client Interface (Dependency Injection)

If object instantiation is required, we could define `QueueManager` as a normal (_service_) class. Then instantiate a single object under the right scope, without requiring a singleton to enforce it.

Rather than restricting the program to all the constraints of having a singleton in the first place.

A _client_ class (i.e. `QueueInterface`) can then be defined, with a constructor that requires an instance of the service (i.e. `QueueManager`). The member functions belonging to `QueueInterface` can take a reference of said instance as a parameter.

!!! This is an example of [dependency injection](https://en.wikipedia.org/wiki/Dependency_injection), which I touched on earlier as a strategy for unit testing singletons

An example of this approach follows below. I've described it in terms of a 'service' and 'client'. Corresponding to `QueueManager` and `QueueInterface` respectively.

Note how the service object (the _dependency_) is directly _injected_ into the client's constructor. It's better than a singleton, but the client still has an explicit dependency on the service class. At least the dependency is obvious to us now, unlike before with the singleton implementation.

```cpp
// class providing the service we want to use
class QueueService
{
public:
	QueueService();
	~QueueService();

	void Send(int value);
	int Receive();
};

// class describing the client that uses the service
class QueueClient
{
public:
	QueueClient(std::unique_ptr<QueueService>&& service)
		: service(std::move(service)){}
	~QueueClient();

	void SendData() { service->Send(); }

private:
	std::unique_ptr<QueueService> service;
};
```

Inside the `main.cpp` we could now have something like this:

```cpp
int main()
{
	QueueClient client{std::unique_ptr<QueueService>()};

	return 0;
}
```

Using dependency injection like this is especially flexible for unit testing. We can create a mock service and use that for the client if we needed.

#### Extension of Service-Client Interface (more decoupling + Inversion of Control)

Better still would be to have an abstract interface class (with pure virtual member functions) that the client could use. The service could implement this interface (i.e. [Inversion of Control](https://en.wikipedia.org/wiki/Inversion_of_control)).

With this strategy, even if the queue implementation completely changes, the interface is entirely decoupled. Meaning any changes to the implementation has no effect on the interface or further downstream.

```cpp
// interface class used by the client and implemented by the QueueService
class QueueInterface
{
public:
	virtual void Send() = 0;
	virtual int Receive() = 0;
	virtual ~QueueInterface() = default;
};

// example of a factory function to return an object instance
std::unique_ptr<QueueInterface> CreateQueueService();
```

```cpp
// same class as before, but sub-class of QueueInterface, implements the queue
class QueueService : QueueInterface
{
public:
	QueueService();
	~QueueService();

	void Send() override {};
	int Receive() override {};
};

std::unique_ptr<QueueInterface> CreateQueueService()
{
	return std::make_unique<QueueService>();
}
```

###Conclusion

The above examples describe viable alternatives to using a singleton pattern. As I hope I've highlighted, singletons come with a lot of baggage.

In the worst of circumstances, they could be adopted as a mantra of some ardent developer, taking root and spreading technical debt in their wake. Whereas in hindsight, I believe it would be a better approach to consider the above alternatives; eschewing singleton drawbacks.

I don't think it's conclusive to say that singletons are _bad_ and should be absolutely avoided. I believe their applicability is more niche than is usually assumed. The worst transgression is rather their overuse, which can spell bedlam.




