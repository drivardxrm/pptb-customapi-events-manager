# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [1.0.6] - 2026-06-04

### Changed

- Updated dependencies: `@fluentui/react-components` 9.73.8 → 9.74.1, `@tanstack/react-query` 5.100.14 → 5.101.0, `react` 19.2.6 → 19.2.7, `react-dom` 19.2.6 → 19.2.7, and `uuid` 13.0.0 → 14.0.0.

### Fixed

- Resolved issue #74 by deriving Dataverse solution component types from entity metadata at runtime and deterministically awaiting that metadata before solution-add flows on cold start.
