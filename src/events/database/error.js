module.exports = {
    name: "error",
    execute() {
        console.log(
            `An error occured with the database connection: \n${error}`
        );
    },
};
