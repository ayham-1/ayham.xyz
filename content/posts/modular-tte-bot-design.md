---
title: "Modular TTE Bot Design"
date: 2025-06-16T00:00:00+02:00
tags: ["code", "tte", "writeup"]
---

As a running tradition in the AuD class at OVGU, students are required to 
participate in a bot writing competition for a game written by senior students.
For this year's competition, 
[Terratician Expandoria](https://terratactician-expandoria.codeberg.page/) was 
chosen. This article will be a description of the features my bot 'Bob the Bot 
the Benevolent Builder II' has to offer as a platform for bot and strategy
development and also act as the description for the secondary creative bot 
competition. The code for the bot can be found [here](https://github.com/ayham-1/tte).

# Terratician Expandoria

![showcase.webp](pix/posts/modular-tte-design/showcase.webp)

The game is a city-builder offering multiple modes of play. I will be focusing
on the 'challenge' mode, since that is what the main competition revolves 
around. The goal is to survive the highest number of rounds, where the demand
of resources increases each round. Each tile, with the exception of grass and
stone tiles, has its own mathematical formula for its respective resource 
production. This article does not only assume that the reader knows how to play
the game, but also that they are familier with such rules. More can be found 
[at the official documentation website.](https://terratactician-expandoria.codeberg.page/en/book/)

# Design Decisions

The following are the design decisions I took when architecting the bot, they
are numbered by the order of importance.

## 1. Mathematical Formulas Are More Accurate

The bot strictly assumes that the formulas of each tile is the most accurate 
description of the tile's relation with other tiles. In order to fully
describe what that means, consider the placement of a wheat tile as example. If
we decide to have a bot where a set of 'wants' are to be fulfilled manually
using a bunch of if-else statements, edge cases such as the tile's proximity 
to Moai and therefore its propagating effect on the Money resource would be 
hard to correctly model. Moreover, it is close to impossible to describe the 
weights of the priorities of 'wants' in a conditional if-else manner. In order 
to avoid such complexities, my bot models the formulas provided in the docs for
every tile manually, allowing for intricate placement decisions from the basic
act of 'maximising' mathematical formulas.

Even though one would be fast to argue that considerations such as placing a 
grass tile beside a Maoi is better than beside a wheat is a very easy decision,
more complex strategies are significantly easier to write when the base 
assumption is that we have a list of placement suggestions ordered by their 
greedy score maximisation. This fact is built upon by the next design decision.

## 2. Negative Rules, i.e. Unwants

Once we have established that 'wants' or in other words 'positive rules' are 
hard to write code for, we can move on to a more systematic way of writing the
rules the bot will use. Consider the following code snippet for the rule
`apply_wheat_groups_size()`:

```java
boolean apply_wheat_groups_size(PlacementSuggestion suggestion, int min, int max) {
    // [rule] force wheat groups to be min maxed
    if (suggestion.info.type == TileType.Wheat) {
        this.bot.map.put(suggestion.coord, suggestion.info);
        int count = this.bot.group_count(TileType.Wheat, suggestion.coord);
        if (count > max || count < min) {
            if (PRINT_DEBUG) System.out.println("[rule] force wheat groups to be min maxed");
            this.bot.map.remove(suggestion.coord);
            return true;
        }
    }
    this.bot.map.remove(suggestion.coord);
    return false;
}
```

From its name, `apply_wheat_groups_size()` is a rule that enforces wheats to be 
grouped with a maximum size of `max`. One can easily notice that the function
gives a judgement on a `PlacementSuggestion`, deciding whether that suggestion
breaks the rule or not. The name 'negative rules' comes from the fact that the
function is rejecting a placement of the wheat tile (represented by
`suggestion`) if its group count is larger than `max`. Likewise, 'positive 
rules' would mean that the suggestion is created by searching for wheat 
placements on the map that make a group less than `max`. Notice, that the 
reason this function works is that the asumption here is that we are judging
best `PlacementSuggestion`s _first_. All rules in the bot are written in 
'negative rules' format. The next design decision will describe how the 
suggestions are created.

## 3. Efficient creation of Placement Suggestions

The bot maintains a `Map<CubeCoordinate, TileInfo>` that represents the actual 
world of the game. There is also an array for every tile type as duplicate to 
the map to allow for quick access by type. Moreover, as there is no official 
API that makes available the list of coordinates where one is allowed to place 
tiles on, the bot also internally maintains a global (relative to the bot) 
`Set<CubeCoordinate>` of placable coordinates. It is also important to keep in 
mind that I have written classes for every tile type, each implementing a 
function which calculates the tile's score. 

From the previously mentioned implementation details, the bot is able to
generate a list of placement suggestions, calculate a score for each suggestion
and sort them from highest delta resource growth to lowest. 

Ofcourse, inorder for Design Decision 1 & 2 to work, we have to calculate the
scores of all tiles that are *relevant* to the current tile. Relevancy here is 
whether the target tile affects another tile in the region. As an example here 
are the functions `affects()` and `in_range()` of the `WindmillRepr` class:

```java
@Override
boolean affects(TileType type) {
    return type == TileType.Marketplace || type == TileType.Moai ||
    type == TileType.Windmill;
}

@Override
boolean in_range(CubeCoordinate coord, TileType type) {
    if (type == TileType.Wheat)
        return this.in_range(coord, 3);
    else if (type == TileType.Forest)
        return this.in_range(coord, 1);
    else
        return false;
}
```

The previous functions describe that any Windmill tile production's score is
always only affected by Wheat and Forest tiles that are in the area of 3 and 1
respectively. And that the Windmill tile itself only affects Marketplaces, 
Moais and other Windmills. These functions are heavily used when calculating
any suggestion's score, as the alternative would mean calculating a global 
score (which is inefficient past round 4). The calculation is done in the 
function `get_relevant_score(TileInfo info, CubeCoordinate coord)` of the 
abstract `Director` class.

## 4. Game Directors

Since the implementation has a `RuleSet` class that holds all the `apply_*` 
functions that represent all the different rules the bot can maintain, a 
question arises: When, How, and Who controls the execution of the rules? Enter: 
directors.

One may want to write 'multiple' bots each having a different strategy,
to ease that process, I have written an abstract class `Director` which 
all 'sub-bots' extend from. The following is a simplified snippet of the 
class:

```java
abstract class Director {
    MyBot bot;
    RuleSet rules;
    ...
    ArrayList<PlacementSuggestion> suggestions = new ArrayList<>();

    abstract boolean do_redraw();
    abstract int redraw_max_times(); 
    ...
    abstract PlacementSuggestion pick();
    ...
    void suggest(PlacementSuggestion suggestion) {...}
    ...
    void ask_for_suggestions(TileType card) {...}
    ...
    void accept_suggestion(PlacementSuggestion suggestion) {...}
    ...
    Score get_relevant_score(TileInfo info, CubeCoordinate coord) {...}
    ...
    TileType get_preferred_tile(List<TileType> hand) {...}
}
```

The methods are expected to be called directly from the `executeTurn` 
function. The order is vaguely like so: `get_preferred_tile()` -> 
`ask_for_suggestions()` -> `pick()` -> `accept_suggestion()`.

The function `suggest()` is called by the classes that represent each tile to
submit a `PlacementSuggestion` to the Director.

# Dictators and The Bot Development Platform

'Dictators' is the _very technical_ term used internally to represent the classes
that extend the class `Director`.

Currently the available bots are:

- `GreedyDictator`: Simply selects the best placement
- `StrictDictator`: Applies rules without disabling/parameter optimization.
- `DynamicDictator`: Rules are applied with paramenters that are tested 
    extensively (method described later)

To show how easy it is to start developing bot strategies using this platform,
here is the entirety of the `GreedyDictator` bot code:

```java
class GreedyDictator extends Director {
    /* Greedy dictator, just selects the placement with highest score delta,
     * no consideration for the future, rules with no rules */
    GreedyDictator(MyBot bot) { super(bot); }

    @Override
    PlacementSuggestion pick() {
        Collections.sort(this.suggestions);
        if (!this.suggestions.isEmpty()) return this.suggestions.getLast();
        else return null;
    }

    @Override
    int redraw_max_times() {
        return this.redraw_max_times(0.11f, 5.0f, 0.05f);
    }

    @Override
    boolean do_redraw() {
        return this.do_redraw(3.0f / 5.0f, 0.0f);
    }
}
```

If you are interested in the performance of `GreedyDictator`, here is a very 
small analysis (n=35+2 known seeds):

```bash
Average round value over 37 runs: 6.49
Average food value over 37 runs: 29703.03
Average materials value over 37 runs: 58749.31
Average moneys value over 37 runs: 45257.50

Standard deviation of rounds over 37 runs: 2.663
Standard deviation of food over 37 runs: 21948.610
Standard deviation of materials over 37 runs: 36599.263
Standard deviation of moneys over 37 runs: 28670.699

Rounds Histogram:
 1 | ███ (3)
 2 | █ (1)
 3 | ██ (2)
 4 | ███ (3)
 5 | ████ (4)
 7 | █████ (5)
 8 | ████████████ (12)
 9 | █████ (5)
10 | █ (1)
11 | █ (1)
```

Even though the bot reaches round 11, it is very inconsistent with a standard 
deviation of around 3. Because I believe a bot's performance is not just about 
its average round/resource count but also its standard deviation and highest 
frequency count, I will not be making comparisons between `GreedyDictator` and
the performance of the average bot on the AuD scoreboards (Although I would be 
very interested in the percentage of people that beat the greedy approach).

## Beating the Greedy Approach & My Submission

In order to show how easy it is to describe 'winning' bots using my platform,
here is the entirety of my bot's submission(`DynamicDictator`). Which has the 
following performance (n=150+2):

```bash
Average round value over 152 runs: 8.86
Average food value over 152 runs: 57315.68
Average materials value over 152 runs: 88029.77
Average moneys value over 152 runs: 76918.13

Standard deviation of rounds over 152 runs: 2.142
Standard deviation of food over 152 runs: 25501.124
Standard deviation of materials over 152 runs: 33786.399
Standard deviation of moneys over 152 runs: 31244.462

Rounds Histogram:
 1 | █████ (5)
 3 | █ (1)
 4 | ██ (2)
 5 | ███ (3)
 6 | ████ (4)
 7 | █████████ (9)
 8 | ███████████████████ (19)
 9 | ████████████████████████████████████ (36)
10 | ████████████████████████████████████████████████████████ (56)
11 | █████████████ (13)
12 | ███ (3)
13 | █ (1)
```

Admittedly, the results are very much dependendant on the random seeds. However,
if you run the `DynamicDictator` bot analysis multiple times, you would see a 
consistent lower standard deviation (around 2, if lucky less). And a higher 
round average of 8.86.

`DynamicDictator` code:
```java
class DynamicDictator extends Director {
    /* dynamic dictator, follows rules, but doesn't worship them,
     * sometimes rules are meant to be broken, and this dictator
     * knows when to break them. sometimes rules are outdated
     * mid-game, or sometimes rules are meant for late-game
     * */
    DynamicDictator(MyBot bot) { super(bot); }

    @Override
    int redraw_max_times() { return this.redraw_max_times(0.1f, 6.0f, 0.00f); }

    @Override
    boolean do_redraw() { return this.do_redraw(1.0f / 5.0f, 0.0f); }

    @Override
    PlacementSuggestion pick() {
        PlacementSuggestion best = null;

        Collections.sort(this.suggestions);
        if (PRINT_DEBUG)
        System.out.println("[round] " + this.bot.round);

        for (var suggestion : this.suggestions.reversed()) {
            if (this.rules.apply_wheat_groups_size(suggestion, 0, 9))
            continue;
            if (this.rules.apply_forest_groups_size(suggestion, 0, 7))
            continue;
            if (this.bot.round > 0 && this.rules.apply_avoid_forest(suggestion, 7))
            continue;
            if (this.bot.round >= 1 && this.rules.apply_wheat_neighbors(suggestion))
            continue;
            if (this.rules.apply_wheat_not_to_join_other_together(suggestion))
            continue;
            if (this.rules.apply_dont_block_wheats(suggestion))
            continue;
            if (this.rules.apply_avoid_wheats_if_windmills_not_present(suggestion))
            continue;
            if (this.rules.apply_windmills_per_wheat(suggestion))
            continue;
            if (this.rules.apply_windmills_not_beside_forest(suggestion))
            continue;
            if (this.rules.apply_dhouse_less_than_3(suggestion))
            continue;
            if (this.rules.apply_moais_spaced(suggestion))
            continue;
            if (this.bot.round >= 1 && this.bot.round <= 9 &&
            this.rules.apply_stones_not_beside_wheat(suggestion))
            continue;
            best = suggestion;
            break;
        }
        return best;
    }
}
```

Due to the limitation of time I can spend on this, the performance of the 
previous `DynamicDictator` is not to its full potential. I believe with enough
time spent, one can theoretically achieve way better performance.

## Discussing Strategy

The following are some of the observations I made when developing the bot,
there is no guarantee they are correct. They are here just as a potential
guidance for strategy developers:

- only one placement of a tile is allowed per turn
- memory is more abundant than time
- the longer the tile is placed the better
- more tiles placed earlier the better
- marketplaces convert food/materials to money, and they are very important for
money production (develope good percentage calculators)
- after placing using `controller.placeTile()`, `world.getMap()` does not update (same turn)
- begining new wheat groups in expectation of windmills is a good strategy

# Testing the Bot

Testing a bot's performance requires the definition of what does it mean to have
a 'performant bot'. The official AuD competition (currently as of 06.06) 
measures a bot's performance through the average of 100 seeds. Of course that 
is very arguable, as getting an unlucky batch of 100 seeds will disadvantage 
certain bots (due to the nature of the redraw of tiles). As such, I personally
just used standard deviation and running the bot over a large number of seeds
multiple times until I got a decent looking analysis before uploading the bot.

Speaking of analysis, I used the python script `run-avgs` (found in the git 
repo) which runs the bot over a user-specified number of seeds, saving them to 
a file, and calculates the different metrics (as shown previously in this 
article).

# Conclusion

The game itself has probably an implicit soft-limit on the average of rounds a
bot can reasonably achieve without over-optimization. The way the tiles redraw
is programmed means that sooner or later, you will get unlucky with your 
card draws and fail the run. There is no current garauntee from the game that 
one can endlessly reach the next round's target resources.

So if the game is not designed to allow for endless runs and the success of a 
bot just means reaching round 5, you may ask: was it all worth it? And for that 
I answer: need it be?
