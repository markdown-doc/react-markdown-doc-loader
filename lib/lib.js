module.exports = {
  beautyConsole() {
    [].slice.call(arguments).forEach(function(arg) {
      console.log(`
      ===================================
      ${JSON.stringify(arg)}
      ===================================
      `);
    })
  }
}
