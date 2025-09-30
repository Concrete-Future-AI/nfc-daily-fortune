-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "nfc_uid" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "gender" VARCHAR(10),
    "date_of_birth" DATE NOT NULL,
    "birth_place" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."fortunes" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "fortune_date" DATE NOT NULL,
    "overall_rating" INTEGER NOT NULL,
    "health_fortune" TEXT NOT NULL,
    "health_suggestion" TEXT NOT NULL,
    "wealth_fortune" TEXT NOT NULL,
    "interpersonal_fortune" TEXT NOT NULL,
    "lucky_color" VARCHAR(50) NOT NULL,
    "action_suggestion" TEXT NOT NULL,
    "raw_ai_response" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fortunes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_nfc_uid_key" ON "public"."users"("nfc_uid");

-- CreateIndex
CREATE UNIQUE INDEX "fortunes_user_id_fortune_date_key" ON "public"."fortunes"("user_id", "fortune_date");

-- AddForeignKey
ALTER TABLE "public"."fortunes" ADD CONSTRAINT "fortunes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
