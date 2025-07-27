import localforage from "localforage";

localforage.config({
  name: "ArcherChat",
  storeName: "archer_data",
});

export default localforage;
