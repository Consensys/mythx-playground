const ConvertLib = artifacts.require("ConvertLib");
const OwnerHelperLibrary = artifacts.require("OwnerHelperLibrary");
const MetaCoin = artifacts.require("MetaCoin");

module.exports = function(deployer) {
  deployer.deploy(ConvertLib);
  deployer.deploy(OwnerHelperLibrary);
  deployer.link(ConvertLib, MetaCoin);
  deployer.link(OwnerHelperLibrary, MetaCoin);
  deployer.deploy(MetaCoin);
};
