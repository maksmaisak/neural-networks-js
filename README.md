# neural-networks-js

### [Demo][demo link]

It is a simulation of simple environments populated by [intelligent agents] which use [artificial neural networks] to make decisions. The general idea is as follows.

Each agent contains a simple neural network (a [multilayer perceptron]) which is, essentially, a function which takes and returns a set of numbers. The input of the NN is the data from various "sensors", represented by numbers. The outputs are used to determine the actions of the agent. 

The agents' behavior in the environment is simulated in short "rounds". At the end of each round the "fitness" of each agent is evaluated. The fittest agents' data (their "genome") gets crossed over and, with a low probability, mutated to produce a new population for the next round.

---

The agents are blue creatures in a small 2D world, which also contains green "food pellets". Each creature's health gets increased whenever they come into contact with a food pellet, which gets destroyed in the process. Health may decrease as a result of collision with another creature. Upon reaching zero health, creatures die to form corpses, which are equal in function to food pellets. The fitness of each creature is dependent on its health by the end of the round. Over numerous generations the creatures learn to move to maximize their health, e.g. seek food and avoid collisions. 

The sensors of each agent register information related to relative positions of nearby agents and food pellets. The outputs of each agent's neural network define its acceleration and rotation for the current step of the simulation.

The project was written in JavaScript for the web. I used [math.js] to implement the agents' neural networks. An online demonstration is available [here][demo link].

[intelligent agents]: https://en.wikipedia.org/wiki/Intelligent_agent
[artificial neural networks]: https://en.wikipedia.org/wiki/Artificial_neural_network
[multilayer perceptron]: https://en.wikipedia.org/wiki/Multilayer_perceptron

[math.js]: http://mathjs.org/
[demo link]: http://fazan64.github.io/neural-networks-js/