-- Instruction-quality reframe (2026-08-23): implementation_logic no longer captures the AI's
-- pre-edit draft; it captures the AI's summary of the user's instructions. Rename accordingly.
ALTER TABLE submissions RENAME COLUMN original_draft TO instruction_summary;

COMMENT ON COLUMN submissions.instruction_summary IS 'implementation_logic only: the AI''s recap of the user''s instructions (optional soft-corroboration signal for the re-cast Layer 2). Renamed from original_draft on 2026-08-23.';
