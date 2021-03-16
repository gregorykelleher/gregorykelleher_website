---
title: Decision Theory and Software Design
date: 12:23 03/16/2021
highlight:
    theme: monokai
taxonomy:
    category: blog
    tag: [decision theory, heurisics, software design]
---

For a discipline supposedly rooted in rationale and logic, it's surprising there isn't a greater emphasis placed on decision theory. All too often, critical decisions are led by heuristics rather than formal methods.

![butterfly](butterfly.svg)

===

### Background

Recently I'd been working on a software project that had made an idiosyncratic choice in terms of the domain language. It wasn't apparent to me why the choice had been made in favour of this language, given its applicability to the problem context felt aberrant at best.

From an outsider's perspective, there were evidently more appropriate choices that could've been made in retrospect, so it perplexed me as to how this foregone decision had been made in the first place. It led me to consider the decision process that cultivated this sub-optimal outcome.

My intention isn't in admonishing poor design choices, but rather to better understand the factors that influence said choices. It goes without saying that fundamental decisions on language or architecture are critical to the overall success of a project.

Hence, it's equally important in recognising the merits of optimal decision-making. This naturally drew me into the field of Decision Theory, and how I might best learn to make informed software decisions myself.

### Extinction by Instinct

My initial suspicions were consequent on working with the language directly. The more I dove into the project, the better I understood its impracticality. That's not to say the language is intrinsically "flawed", rather it's ill-suited to the task at hand. The longer I spent hacking away, bending it to work, the more I felt I was trying to "fit a square peg into a round hole".

Likewise too, the better I understood the domain, the better I could reason why other programming languages were more widely popular in this context. Giving into speculation, why had this esoteric choice been made?

The answer I learnt was plainly,

> _It's the language that's always been used_

On face value, this is a sensible decision. Everyone is competent in this language and every other internal project has been completed in this language too. What's more, the language is supported in this new domain so it should be easy to reuse familiar tools and patterns.

And indeed, things do work. Just. Not optimally, but just well enough that the difficulty in doing so can be justified. Therein lies the difference between two styles of decision-making; satisficing vs maximising.

The choice of language was a satisficing decision, rooted in reaching a pragmatic solution that had the consensus of the team. Rather than exerting effort in evaluating the wider unknowns of the problem domain to formulate an informed if not, idealised decision.

### Prevalence of Heuristics in Software Development

This no-frills decision-making strategy evokes the mantra of _"move fast and break things"_.

In fact, by and large, the software industry revolves around this hypothesis. Agile sprints, rapid iteration, minimal viable products .etc. The jargon practically promotes satisficing with every sip of the kool-aid.

Paradoxically then, this mindset is grounded moreso in intuition than reason or logic. So why the dichotomy?

I think this can be explained by our own innate dispositions. As with any decision, it's human behaviour to seek the most convenient conclusion by the principle of least effort (i.e. _"path of least resistance"_). Moreover, most decisions in day-to-day life are also inconsequential, hence it's only economical to lean on heuristics. However, in our routine, this can become habitual - sometimes to our detriment.

This is evidenced most acutely by the complex decisions that must be concluded in software design. In these circumstances, our rationality is in fact, _bounded_. Our time, cognitive capacity and autonomy are limited. These constraints exert pressures on our ability to _maximise_ our decisions. It follows then, that we seek to compromise with a bias for our own utility.

Unfortunately, software doesn't forget, and it never forgives. A compromised start inevitably leads to a compromised end. Hence why perfect software doesn't exist, it's simply infeasible to develop perfect software based on pure rational decisions in the real world.

### Recognising Heuristics in Decision Processing

With that doom and gloom summarily described, is it worth simply conceding to heuristic-based decision processing?

I could never acquisce to that approach. Anecdotally, it's always been my experience that software entrophy begets software entrophy. Sometimes dubbed "software rot" or rather benignly "technical debt", in any case it only propagates decay. David Thomas, in his book, "The Pragmatic Programmer" applies the analogy of the [Broken Window Theory](https://en.wikipedia.org/wiki/Broken_windows_theory#:~:text=The%20broken%20windows%20theory%20is,and%20disorder%2C%20including%20serious%20crimes.) to illustrate the effects entrophy can have on a project,

> _"Don't leave "broken windows" (bad designs, wrong decisions, or poor code) unrepaired. Fix each one as soon as it is discovered. If there is insufficient time to fix it properly, then board it up. Perhaps you can comment out the data instead. Take some action to prevent further damage and to show that you're on top of the situation"_

> _"We've seen clean, functional systems deteriorate pretty quickly once windows start breaking. There are other factors that can contribute to software rot [...] but neglect accelerates the rot faster than any other factor"_

> _"One broken window - a badly designed piece of code, a poor management decision that the team must live with for the duration of the project - is all it takes to start the decline"_

His advice is prescriptive. Do not tolerate broken windows, and to highlight his words verbatim, _"bad designs"_ and _"wrong decisions"_. Whilst these are sound words, it doesn't afford any insight as to how to mitigate the likelihood of broken windows occurring from the onset.

This leaves us with an uncomfortable catch-22 of sorts. If it's indeed impossible to make utterly rational decisions, and heuristics are a crutch, how can we write good software?

First and foremost, the easiest means of minimising poor decisions is a self-awareness of our own cognitive biases. Biases aren't inherently "bad" but rather, they can lead us astray towards inferior outcomes. Returning to my opening remarks about the choice of programming language being maladaptive, it's obvious that there are heuristics at play.

The observation on the pervasive use of the language for every contingency strongly suggests an ingrained sense of "status quo bias". This "anchoring" around the language sustains a self-reinforcing feedback loop, that only affirms the established norm.

This central tenet engenders other adverse cognitive biases that only serve to augment the dominant thought, rather than negate it.

#### Information Cascade

An information cascade can explain the adoption of the familiar language over other (more optimal) alternatives. In simple terms, it occurs when we, as individuals, decide to select the _same_ choices as made by others prior. In lieu of our own independent decision, we instead place our favour in the inference of our peers' actions.

This desire for conformity can _cascade_ poor choices, as everyone jumps on the same bandwagon so to speak. This groupthink entrenches the decision, as the desire for consensus outweighs critical evaluation. Usually the outcome of which drifts towards a more moderate option. This in turn, is a manifestation of the _"Compromise Effect"_ where we assume the most middling choice carries the most benefit.

This evokes the adage,

> _"nobody ever got fired for buying IBM"_

#### Escalation of Commitment

With a compromised decision established, collective attention is placed squarely on the decided choice. Moreover, there's typically little scope afforded to deliberating information that doesn't bear relevance to this choice. In fact, this common-information bias can compound attempts to dislodge a prevailing norm, despite new evidence that might arise to contradict it.

Even in scenarios where the original choice is self-evidently unfavourable, its justification is founded upon the cumulative investment thus far accrued. Irrationally, even when its future detrimental cost outweighs its expected benefit.

This _"sunk cost"_ intransigence deters new ideas from being proposed, and unfortunately only encourages _"confirmation bias"_ in seeking to substantiate what is now perceived to be a tenuous decision.

#### Establishment of Convention

When the desire for group cohesiveness takes precedence, cognitive inertia to change can embedded itself surreptitiously. From which a tendency in favour of _omission_ (inaction) over _commission_ (action) can take hold. This _"Omission Bias"_ as its termed, again reinforces the collective norm.

With convention too comes a predisposition to favour familiarity as a heuristic, of which the _"Einstellung Effect"_ is perhaps the best illustration. It describes our inclination to solve a given problem in a familiar manner, despite more appropriate methods being available.

This succinctly portrays my observations on the misguided strategy of employing a familiar language, without critical evaluation of its appropriateness to the problem domain. Furthermore, it's maladaption to the given problem is exacerbated by _"functional fixedness"_; the inhibition to adjust the use of the language in a dissimilar context.

This cognitive bias is closely related to the _"Law of the Instrument"_ or _"Maslow's Hammer"_, which similarly describes the over-reliance on a familiar tool, despite its shortcomings. To quote Maslow himself,

> _"I suppose it is tempting, if the only tool you have is a hammer, to treat everything as if it were a nail."_

### Dissenting Opinion

In the face of these ingrained biases, it can be difficult to affect change, or even at the very least, voice an opinion contrary to the norm.

No matter how high up the totem pole, our autonomy in shifting an established belief is predicated on our ability to convince others. Without endorsement, ideas cannot establish, let alone flourish.

Unfortunately, in proposing an idea in direct confrontation of an entrenched norm, there is little chance it will overcome inertia, however advantageous it may be. In scenarios such as these, it can be demoralising when ideas don't find credence.

Contrary to seeking approval by traditional consensus, oftentimes the more opportune approach is the realist one. In the words of Grace Hopper,

> _"It's easier to ask for forgiveness than it is to get permission"_

Going ahead and furtively building a prototype (i.e. trojan horse) to demonstrate an idea is a more effective strategy. Especially if it ameliorates a common group inconvenience, i.e. directly appeal to the _"Principle of Least Effort"_. With any luck it can potentially catalyse an idea and undermine faith in the norm.

### Conclusion

I hope this exploration highlighted the causality heuristics incur in software decision-making. It's nigh impossible to eliminate biases completely, much less in convincing others to recognise them in the first place. However, at least with some awareness it may be possible to assuage their impact.

That said, even after thoroughly considering my own arguments, it's difficult not to have a sense of fatalism. No matter how ardent we are to espouse the virtues of making informed decisions, it always comes across self-satisfying.

> The road to hell is paved with good intentions

Business priorities, feature creep, tight deadlines can quickly undue any sincere efforts towards this aim.

I feel as though I'm touching upon Martin Fowler's comments in his article, [Is High Quality Software Worth the Cost?](https://martinfowler.com/articles/is-quality-worth-cost.html) He approaches a similar argument from a different perspective than mine; namely, the "trade-off between software quality and cost".

He broadly claims that there should be a greater emphasis placed on maintaining and enhancing internal quality of software, despite extra effort or imposition that may cause in the short-term. His reasons for this are sound. Whilst initial progress may be slighter, it profoundly reduces the cost of future change.

I agree with his sentiment, and I would also expand upon it with my own remarks on involving a decision-making strategy,

> Producing quality decisions _produces_ quality software

Finally, as to him, I feel as though I'm concluding on the same point. Despite having a valid justification for formal decision-making approaches and creating high quality software, it's a struggle convincing others to the same end.
