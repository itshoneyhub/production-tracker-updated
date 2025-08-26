CREATE TABLE "Projects" (
    "id" VARCHAR(255) PRIMARY KEY,
    "projectNo" VARCHAR(255) NOT NULL,
    "customerName" VARCHAR(255) NOT NULL,
    "owner" VARCHAR(255) NOT NULL,
    "projectDate" DATE NOT NULL,
    "targetDate" DATE NOT NULL,
    "productionStage" VARCHAR(255) NOT NULL,
    "remarks" TEXT
);

CREATE TABLE "Stages" (
    "id" VARCHAR(255) PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "remarks" TEXT
);