-- Source: Sheet 3 from Tabel Profilkes 2025 Final.xlsx
-- Region: Kabupaten Situbondo
-- Year: 2025
-- Counts in the education rows are decimal estimates from the source formulas.

CREATE TABLE IF NOT EXISTS population_literacy_education (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    report_year SMALLINT UNSIGNED NOT NULL,
    region_type VARCHAR(50) NOT NULL,
    region_name VARCHAR(100) NOT NULL,
    metric_code VARCHAR(50) NOT NULL,
    metric_group VARCHAR(30) NOT NULL,
    metric_name VARCHAR(255) NOT NULL,
    male_count DECIMAL(16, 4) NULL,
    female_count DECIMAL(16, 4) NULL,
    total_count DECIMAL(16, 4) NULL,
    male_percentage DECIMAL(12, 8) NULL,
    female_percentage DECIMAL(12, 8) NULL,
    total_percentage DECIMAL(12, 8) NULL,
    source_reference VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_population_literacy_education (
        report_year,
        region_type,
        region_name,
        metric_code
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS population_education_summaries (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    report_year SMALLINT UNSIGNED NOT NULL,
    region_type VARCHAR(50) NOT NULL,
    region_name VARCHAR(100) NOT NULL,
    male_total DECIMAL(16, 4) NOT NULL,
    female_total DECIMAL(16, 4) NOT NULL,
    population_total DECIMAL(16, 4) NOT NULL,
    source_reference VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_population_education_summary (report_year, region_type, region_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

START TRANSACTION;

INSERT INTO population_literacy_education (
    report_year,
    region_type,
    region_name,
    metric_code,
    metric_group,
    metric_name,
    male_count,
    female_count,
    total_count,
    male_percentage,
    female_percentage,
    total_percentage,
    source_reference
) VALUES
    (2025, 'Kabupaten', 'Situbondo', 'population_15_plus', 'population', 'Penduduk berumur 15 tahun ke atas', 277110.0000, 291684.0000, 568794.0000, NULL, NULL, NULL, 'BPS Jawa Timur, Susenas Maret'),
    (2025, 'Kabupaten', 'Situbondo', 'literate_15_plus', 'literacy', 'Penduduk berumur 15 tahun ke atas yang melek huruf', 252641.1870, 236964.0816, 489605.2686, 91.17000000, 81.24000000, 86.07778363, 'BPS Jawa Timur, Susenas Maret'),
    (2025, 'Kabupaten', 'Situbondo', 'no_primary_diploma', 'education', 'Tidak memiliki ijazah SD', 58691.8980, 90976.2396, 149668.1376, 21.18000000, 31.19000000, 26.31324128, 'BPS Jawa Timur, Susenas Maret'),
    (2025, 'Kabupaten', 'Situbondo', 'primary_sd_mi', 'education', 'SD/MI', 78893.2170, 76100.3556, 154993.5726, 28.47000000, 26.09000000, 27.24950907, 'BPS Jawa Timur, Susenas Maret'),
    (2025, 'Kabupaten', 'Situbondo', 'junior_smp_mts', 'education', 'SMP/MTs', 42314.6970, 49294.5960, 91609.2930, 15.27000000, 16.90000000, 16.10588245, 'BPS Jawa Timur, Susenas Maret'),
    (2025, 'Kabupaten', 'Situbondo', 'senior_sma_ma', 'education', 'SMA/MA', 57888.2790, 36898.0260, 94786.3050, 20.89000000, 12.65000000, 16.66443475, 'BPS Jawa Timur, Susenas Maret'),
    (2025, 'Kabupaten', 'Situbondo', 'vocational_smk', 'education', 'Sekolah Menengah Kejuruan', 15629.0040, 10063.0980, 25692.1020, 5.64000000, 3.45000000, 4.51694322, 'BPS Jawa Timur, Susenas Maret'),
    (2025, 'Kabupaten', 'Situbondo', 'diploma_i_ii', 'education', 'Diploma I/Diploma II', 526.5090, 29.1684, 555.6774, 0.19000000, 0.01000000, 0.09769396, 'BPS Jawa Timur, Susenas Maret'),
    (2025, 'Kabupaten', 'Situbondo', 'diploma_iii', 'education', 'Akademi/Diploma III', 1939.7700, 1079.2308, 3019.0008, 0.70000000, 0.37000000, 0.53077227, 'BPS Jawa Timur, Susenas Maret'),
    (2025, 'Kabupaten', 'Situbondo', 'bachelor_diploma_iv', 'education', 'S1/Diploma IV', 17208.5310, 27097.4436, 44305.9746, 6.21000000, 9.29000000, 7.78945886, 'BPS Jawa Timur, Susenas Maret'),
    (2025, 'Kabupaten', 'Situbondo', 'master_doctorate', 'education', 'S2/S3 (Master/Doktor)', 4983.1632, 175.0104, 5158.1736, 1.79826177, 0.06000000, 0.90686146, 'BPS Jawa Timur, Susenas Maret')
ON DUPLICATE KEY UPDATE
    metric_group = VALUES(metric_group),
    metric_name = VALUES(metric_name),
    male_count = VALUES(male_count),
    female_count = VALUES(female_count),
    total_count = VALUES(total_count),
    male_percentage = VALUES(male_percentage),
    female_percentage = VALUES(female_percentage),
    total_percentage = VALUES(total_percentage),
    source_reference = VALUES(source_reference);

INSERT INTO population_education_summaries (
    report_year,
    region_type,
    region_name,
    male_total,
    female_total,
    population_total,
    source_reference
) VALUES (
    2025,
    'Kabupaten',
    'Situbondo',
    278075.0682,
    291713.1684,
    569788.2366,
    'BPS Jawa Timur, Susenas Maret'
)
ON DUPLICATE KEY UPDATE
    male_total = VALUES(male_total),
    female_total = VALUES(female_total),
    population_total = VALUES(population_total),
    source_reference = VALUES(source_reference);

COMMIT;
