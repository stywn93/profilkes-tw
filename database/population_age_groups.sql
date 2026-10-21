-- Source: Sheet 2 from Tabel Profilkes 2025 Final.xlsx
-- Region: Kabupaten Situbondo
-- Year: 2025

CREATE TABLE IF NOT EXISTS population_age_groups (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    report_year SMALLINT UNSIGNED NOT NULL,
    region_type VARCHAR(50) NOT NULL,
    region_name VARCHAR(100) NOT NULL,
    age_group VARCHAR(10) NOT NULL,
    age_min TINYINT UNSIGNED NULL,
    age_max TINYINT UNSIGNED NULL,
    male_count INT UNSIGNED NOT NULL,
    female_count INT UNSIGNED NOT NULL,
    total_count INT UNSIGNED NOT NULL,
    sex_ratio DECIMAL(12, 8) NOT NULL,
    source_reference VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_population_age_group (report_year, region_type, region_name, age_group)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS population_summaries (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    report_year SMALLINT UNSIGNED NOT NULL,
    region_type VARCHAR(50) NOT NULL,
    region_name VARCHAR(100) NOT NULL,
    male_total INT UNSIGNED NOT NULL,
    female_total INT UNSIGNED NOT NULL,
    population_total INT UNSIGNED NOT NULL,
    sex_ratio DECIMAL(12, 8) NOT NULL,
    dependency_ratio DECIMAL(12, 8) NOT NULL,
    source_reference VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_population_summary (report_year, region_type, region_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

START TRANSACTION;

INSERT INTO population_age_groups (
    report_year,
    region_type,
    region_name,
    age_group,
    age_min,
    age_max,
    male_count,
    female_count,
    total_count,
    sex_ratio,
    source_reference
) VALUES
    (2025, 'Kabupaten', 'Situbondo', '0 - 4', 0, 4, 25476, 24430, 49906, 104.28162096, 'KMK HK.01.07/MENKES/140/2024'),
    (2025, 'Kabupaten', 'Situbondo', '5 - 9', 5, 9, 21357, 20654, 42011, 103.40369904, 'KMK HK.01.07/MENKES/140/2024'),
    (2025, 'Kabupaten', 'Situbondo', '10 - 14', 10, 14, 22110, 21422, 43532, 103.21165157, 'KMK HK.01.07/MENKES/140/2024'),
    (2025, 'Kabupaten', 'Situbondo', '15 - 19', 15, 19, 23883, 22360, 46243, 106.81127013, 'KMK HK.01.07/MENKES/140/2024'),
    (2025, 'Kabupaten', 'Situbondo', '20 - 24', 20, 24, 25467, 24566, 50033, 103.66767076, 'KMK HK.01.07/MENKES/140/2024'),
    (2025, 'Kabupaten', 'Situbondo', '25 - 29', 25, 29, 25333, 24694, 50027, 102.58767312, 'KMK HK.01.07/MENKES/140/2024'),
    (2025, 'Kabupaten', 'Situbondo', '30 - 34', 30, 34, 25013, 25773, 50786, 97.05117759, 'KMK HK.01.07/MENKES/140/2024'),
    (2025, 'Kabupaten', 'Situbondo', '35 - 39', 35, 39, 25260, 26123, 51383, 96.69639781, 'KMK HK.01.07/MENKES/140/2024'),
    (2025, 'Kabupaten', 'Situbondo', '40 - 44', 40, 44, 24369, 26332, 50701, 92.54519216, 'KMK HK.01.07/MENKES/140/2024'),
    (2025, 'Kabupaten', 'Situbondo', '45 - 49', 45, 49, 25787, 27172, 52959, 94.90284116, 'KMK HK.01.07/MENKES/140/2024'),
    (2025, 'Kabupaten', 'Situbondo', '50 - 54', 50, 54, 24038, 25062, 49100, 95.91413295, 'KMK HK.01.07/MENKES/140/2024'),
    (2025, 'Kabupaten', 'Situbondo', '55 - 59', 55, 59, 22446, 23270, 45716, 96.45896003, 'KMK HK.01.07/MENKES/140/2024'),
    (2025, 'Kabupaten', 'Situbondo', '60 - 64', 60, 64, 18794, 20315, 39109, 92.51292149, 'KMK HK.01.07/MENKES/140/2024'),
    (2025, 'Kabupaten', 'Situbondo', '65 - 69', 65, 69, 15125, 17144, 32269, 88.22328511, 'KMK HK.01.07/MENKES/140/2024'),
    (2025, 'Kabupaten', 'Situbondo', '70 - 74', 70, 74, 11077, 12993, 24070, 85.25359809, 'KMK HK.01.07/MENKES/140/2024'),
    (2025, 'Kabupaten', 'Situbondo', '75+', 75, NULL, 10518, 15880, 26398, 66.23425693, 'KMK HK.01.07/MENKES/140/2024')
ON DUPLICATE KEY UPDATE
    age_min = VALUES(age_min),
    age_max = VALUES(age_max),
    male_count = VALUES(male_count),
    female_count = VALUES(female_count),
    total_count = VALUES(total_count),
    sex_ratio = VALUES(sex_ratio),
    source_reference = VALUES(source_reference);

INSERT INTO population_summaries (
    report_year,
    region_type,
    region_name,
    male_total,
    female_total,
    population_total,
    sex_ratio,
    dependency_ratio,
    source_reference
) VALUES (
    2025,
    'Kabupaten',
    'Situbondo',
    346053,
    358190,
    704243,
    96.61157486,
    44.88897393,
    'KMK HK.01.07/MENKES/140/2024'
)
ON DUPLICATE KEY UPDATE
    male_total = VALUES(male_total),
    female_total = VALUES(female_total),
    population_total = VALUES(population_total),
    sex_ratio = VALUES(sex_ratio),
    dependency_ratio = VALUES(dependency_ratio),
    source_reference = VALUES(source_reference);

COMMIT;
