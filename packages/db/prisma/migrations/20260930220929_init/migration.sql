-- CreateTable
CREATE TABLE "districts" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "us_state" CHAR(2) NOT NULL,

    CONSTRAINT "districts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schools" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "district_id" INTEGER NOT NULL,

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" SERIAL NOT NULL,
    "given_name" TEXT NOT NULL,
    "family_name" TEXT NOT NULL,
    "grade" SMALLINT NOT NULL,
    "school_id" INTEGER NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teachers" (
    "id" SERIAL NOT NULL,
    "given_name" TEXT NOT NULL,
    "family_name" TEXT NOT NULL,
    "email_address" TEXT NOT NULL,
    "school_id" INTEGER NOT NULL,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "districts_us_state_idx" ON "districts"("us_state");

-- CreateIndex
CREATE INDEX "schools_district_id_idx" ON "schools"("district_id");

-- CreateIndex
CREATE INDEX "students_school_id_idx" ON "students"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_email_address_key" ON "teachers"("email_address");

-- CreateIndex
CREATE INDEX "teachers_school_id_idx" ON "teachers"("school_id");

-- AddForeignKey
ALTER TABLE "schools" ADD CONSTRAINT "schools_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
