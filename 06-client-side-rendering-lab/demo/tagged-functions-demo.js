function introduction(input, ...dynamicData) {
    console.log(input);
    console.log(dynamicData);
}

const name = 'Pen4o';
const age = 35;
introduction`Hi, my name is ${name}, and I am ${age} years old.`;