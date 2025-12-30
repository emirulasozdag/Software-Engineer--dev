"""Test script to verify audio manager functionality."""

from app.infrastructure.external.audio_manager import AudioFileManager
from app.domain.enums import LanguageLevel


def test_audio_manager():
    """Test the audio manager to ensure it works correctly."""
    
    audio_manager = AudioFileManager()
    
    print("Testing Audio File Manager\n" + "="*50)
    
    # Test 1: Get all A1 files
    print("\n1. Testing get_by_level for A1:")
    a1_files = audio_manager.get_by_level(LanguageLevel.A1)
    print(f"   Found {len(a1_files)} A1 audio files")
    for af in a1_files:
        print(f"   - {af.filename} ({af.level.value})")
        print(f"     Script preview: {af.script[:100]}...")
    
    # Test 2: Get random files for placement test
    print("\n2. Testing get_random_for_placement_test:")
    placement_audios = audio_manager.get_random_for_placement_test()
    for level, audio in placement_audios.items():
        print(f"   {level.value}: {audio.filename}")
        print(f"     URL: {audio_manager.get_audio_url(audio.filename)}")
    
    # Test 3: Get random B1 file
    print("\n3. Testing get_random_by_level for B1 (count=1):")
    b1_files = audio_manager.get_random_by_level(LanguageLevel.B1, count=1)
    if b1_files:
        print(f"   Selected: {b1_files[0].filename}")
    else:
        print("   No B1 files found")
    
    print("\n" + "="*50)
    print("Audio manager test completed successfully!")


if __name__ == "__main__":
    test_audio_manager()
