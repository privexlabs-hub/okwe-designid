/**
 * Okwe Import Export Solutions — the owner's business document, as data.
 *
 * Transcribed verbatim. The only change is one typo in the source,
 * "fa6cilitating" → "facilitating". Where the document says "OKWE MOVES."
 * in its closing line, that is kept as written.
 *
 * This is the architecture every other surface now follows: one business,
 * three operational processes, not three businesses.
 */

export interface BusinessProcess {
  id: "knows" | "coms" | "move";
  name: string;
  role: string;
  summary: string;
  focus: string;
  activities: string[];
  purpose: string;
}

export const BUSINESS = {
  name: "Okwe Import Export Solutions",
  overview: [
    "Okwe Import Export Solutions is an integrated trade and logistics business focused on facilitating the movement of goods from opportunity to destination.",
    "The business brings together the key activities required to make trade happen: understanding opportunities, connecting commercial parties, and moving goods efficiently.",
    "These are not separate businesses. They are three operational components of one integrated Okwe Import Export Solutions business.",
  ],
  core: {
    journey: ["KNOW", "COMS", "MOVE"],
    lead: "The Okwe model is built around a simple trade journey:",
    steps: [
      {
        title: "Know the opportunity.",
        body: "Understand the product, market, supplier, buyer, requirements and commercial environment.",
      },
      {
        title: "Connect and execute.",
        body: "Communicate with the relevant parties, establish relationships, negotiate and facilitate the transaction.",
      },
      {
        title: "Move the goods.",
        body: "Coordinate the physical movement of goods from their point of origin to their destination.",
      },
    ],
    close:
      "This creates an integrated process from market intelligence and sourcing through commercial execution and logistics.",
  },
  processes: [
    {
      id: "knows",
      name: "Okwe Knows",
      role: "Knowledge & Intelligence",
      summary: "Okwe Knows is the knowledge and intelligence process of the business.",
      focus:
        "It focuses on gathering, organizing and applying information needed to make informed trade decisions.",
      activities: [
        "Market and product research",
        "Supplier and buyer research",
        "Product sourcing",
        "Market intelligence",
        "Trade information",
        "Price and availability research",
        "Regulatory and documentation information",
        "Commercial advisory",
        "Opportunity identification",
      ],
      purpose:
        "Know what is available, where it is available, who needs it, and how the trade can be executed.",
    },
    {
      id: "coms",
      name: "Okwe Coms",
      role: "Communication & Commerce",
      summary: "Okwe Coms is the communication and commercial coordination process.",
      focus:
        "It connects the different parties involved in a transaction and helps move an opportunity toward an actual trade.",
      activities: [
        "Buyer and supplier communication",
        "Business introductions",
        "Procurement coordination",
        "Negotiation support",
        "Quotation and order coordination",
        "Commercial relationship management",
        "Transaction coordination",
        "Trade documentation communication",
        "Partner and stakeholder coordination",
      ],
      purpose: "Turn information and opportunities into commercial relationships and transactions.",
    },
    {
      id: "move",
      name: "Okwe Move",
      role: "Movement & Logistics",
      summary: "Okwe Move is the movement and logistics process.",
      focus:
        "Once a trade is agreed, Okwe coordinates the physical movement of goods through the appropriate logistics channels.",
      activities: [
        "Transportation coordination",
        "Freight and shipping coordination",
        "Import and export logistics",
        "Cargo handling coordination",
        "Warehousing coordination",
        "Distribution",
        "Delivery",
        "Shipment tracking",
        "Origin-to-destination logistics management",
      ],
      purpose: "Get the right goods from the right place to the right destination efficiently.",
    },
  ] as BusinessProcess[],
  flow: {
    lead: "The three processes work together as one operating system.",
    steps: [
      { name: "IDENTIFY", body: "Okwe Knows researches and identifies a product, supplier, buyer or trade opportunity." },
      { name: "CONNECT", body: "Okwe Coms establishes communication between the relevant parties and facilitates the commercial process." },
      { name: "TRANSACT", body: "The parties agree on the commercial terms and the transaction is coordinated." },
      { name: "MOVE", body: "Okwe Move coordinates the logistics required to move the goods." },
      { name: "DELIVER", body: "The goods reach their intended destination and the trade process is completed." },
    ],
    close:
      "This allows Okwe to participate in different parts of the trade cycle depending on the customer's needs.",
  },
  customers: [
    "Importers",
    "Exporters",
    "Manufacturers",
    "Wholesalers",
    "Distributors",
    "Retailers",
    "Businesses seeking international suppliers",
    "Businesses seeking international buyers",
    "SMEs entering new markets",
    "Organizations requiring sourcing and logistics support",
    "Individuals and businesses involved in cross-border trade",
  ],
  value: {
    body: [
      "Okwe simplifies trade by bringing together knowledge, commercial coordination and logistics within one business.",
      "Instead of a customer having to separately find information, identify a supplier or buyer, coordinate the transaction and arrange movement, Okwe can provide an integrated pathway through the entire process.",
    ],
    promise: "We help you know the opportunity, connect the trade, and move the goods.",
  },
  positioning: {
    statement:
      "Okwe Import Export Solutions should be positioned as an integrated trade facilitation and logistics company, rather than simply a shipping or import/export company.",
    formula: "Information + Relationships + Trade + Movement",
    intersection: ["Trade", "Sourcing", "Commerce", "Logistics", "Market intelligence", "Business connections"],
  },
  architecture: {
    umbrella: "OKWE IMPORT EXPORT SOLUTIONS",
    together: "OKWE KNOWS. OKWE COMS. OKWE MOVES.",
    commercial: "Know the opportunity. Connect the trade. Move the goods.",
  },
  vision: [
    "Okwe Import Export Solutions aims to develop into an integrated trade platform that makes it easier for businesses to discover opportunities, establish commercial relationships and move goods across markets.",
    "The long-term opportunity is to build a connected ecosystem around trade — where information leads to connections, connections lead to transactions, and transactions lead to movement.",
  ],
  philosophy: "Know. Connect. Move.",
} as const;
