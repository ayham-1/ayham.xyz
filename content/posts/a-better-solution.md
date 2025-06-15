---
title: "A Better Design Solution"
date: 2025-05-18T21:52:31+02:00
draft: true
---

# A Software Design Problem

I recently attended a Programming Paradigms lecture that proposed the following
design problem to be solved in 'The OOP' way.

> Create an online store that allows customers to add features to their car and 
which calculates the total price for them

## The OOP Design

Keeping in mind that the solution *must* be the OOP way, the following is
proposed:

```java
interface ConfigurableCar { int getPrice(); }

public class Car implements ConfigurableCar {
    public int getPrice() { return 12000; }
}

abstract class CarFeature implements ConfigurableCar {
    protected ConfigurableCar feature;
    public CarFeature(ConfigurableCar additionalFeature) {
        this.feature = additionalFeature;
    }
}

public class ABS extends CarFeature {
    public ABS(ConfigurableCar additionalFeature) {
        super(additionalFeature);
    }
    public int getPrice() {
        return this.feature.getPrice() + 6000;
    }
}

public class ESP extends CarFeature {
    public ABS(ConfigurableCar additionalFeature) {
        super(additionalFeature);
    }
    public int getPrice() {
        return this.feature.getPrice() + 4000;
    }
}

// Usage
ConfigurableCar myCar1 = new Car();
ConfigurableCar myCar2 = new ABS(new Car());
ConfigurableCar myCar3 = new ESP(new ABS(new Car()));
```

The problems of such an approach may seem hidden to those of us who drink the 
OOP-koolaid. Afterall, the code is supposedly 'easily' expandable. New features
could be created by writing new classes, and included by chaining them 
when creating a new car. One can also modify the `CarFeature` class so that 
addition of features after the instantiation of the car object is possible. 
How convenient is that? All the features of every instance can be drawn on a 
fancy graph to represent a simple linked list! One can also be justifiably 
tricked into the quick conclusion of naming such an approach 'elegant'.

### The Oops in the OOP

- code is meant to be restrictive/specific
- therefore let's look at what the prev does
- value of computer oriented
- disengage from abstract 'Objects'
- and engage with how a computer works

```c

```
