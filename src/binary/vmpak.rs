use std::{fs::File, io::{self, Read, Seek, SeekFrom, Write}, path::Path};

// File identifier: V M P K (0x56, 0x4D, 0x50, 0x4B)
#[allow(dead_code)] // Even though its used further down
pub const VMPAK_MAGIC: u32 = 0x4B504D56; // Sorted litte-endian: 0x564D504B

#[derive(Debug, Clone, Copy)]
#[allow(dead_code)]
pub struct VmpakHeader {
    pub magic: u32,
    pub format_version: u16,
    pub manager_version: u16,
    pub index_table_offset: u64,
    pub metadata_size: u64,
    pub flags: u8,
    pub reserved: u8
}

#[allow(dead_code)]
pub fn implement_vmpak_example(filepath: &Path) -> io::Result<()> {
    let mut file = File::create(filepath)?;
    let metadata_string = "Creator: Test User\nDescription: My first vmpak";
    let metadata_bytes = metadata_string.as_bytes();

    let index_table_offset: u64 = VmpakHeader::SIZE as u64 + metadata_bytes.len() as u64;

    let header = VmpakHeader {
        magic: VMPAK_MAGIC,
        format_version: 1,
        manager_version: 105,
        index_table_offset: index_table_offset,
        metadata_size: metadata_bytes.iter().len() as u64,
        flags: 0b0000_0001, // Example: bit 0 set (Has configs)
        reserved: 0
    };

    println!("-> Creating file: {}", filepath.display());
    header.write(&mut file)?;

    file.write_all(metadata_bytes)?;

    let dummy_index_data = [0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF, 0x01, 0x02];
    file.write_all(&dummy_index_data)?;

    // Now read it back
    let mut file_reader = File::open(filepath)?;

    println!("\n -> Reading file header...");
    let read_header = VmpakHeader::read(&mut file_reader)?;
    println!("{:#?}", read_header);

    println!("\n-> Seeking to metadata");
    file_reader.seek(SeekFrom::Start(VmpakHeader::SIZE as u64))?;

    let mut metadata_buffer = vec![0u8; read_header.metadata_size as usize];
    file_reader.read_exact(&mut metadata_buffer)?;

    let metadata_string_read = String::from_utf8(metadata_buffer)
        .unwrap_or_else(|_| String::from("Metadata is not valid UTF-8"));

    println!("-> Metadata:\n{}", metadata_string_read);

    println!("\n-> Seeking to Index Table (offset: {})", read_header.index_table_offset);
    file_reader.seek(SeekFrom::Start(read_header.index_table_offset as u64))?;

    let mut index_table_buffer = vec![0u8; 8];
    file_reader.read_exact(&mut index_table_buffer)?;

    println!("-> Index table data (raw): {:?}", index_table_buffer);

    println!("\nFile successfully created and read");
    Ok(())
}


#[derive(Debug, Clone)]
#[allow(dead_code)]
pub struct VmpakMetadata {
    pub creator: String,
    pub description: String
}

impl VmpakHeader {
    // Size of the VmpakHeader in bytes
    pub const SIZE: usize = 4 + 2 + 2 + 8 + 8 + 1 + 1;

    pub fn write<W: Write>(&self, writer: &mut W) -> io::Result<()> {
        writer.write_all(&self.magic.to_le_bytes())?;
        writer.write_all(&self.format_version.to_le_bytes())?;
        writer.write_all(&self.manager_version.to_le_bytes())?;
        writer.write_all(&self.index_table_offset.to_le_bytes())?;
        writer.write_all(&self.metadata_size.to_le_bytes())?;
        writer.write_all(&self.flags.to_le_bytes())?;
        writer.write_all(&self.reserved.to_le_bytes())?;
        Ok(())
    }

    pub fn read<R: Read>(reader: &mut R) -> io::Result<Self> {
        let mut buffer = [0u8; Self::SIZE];
        reader.read_exact(&mut buffer)?;

        let mut offset = 0;

        let magic = u32::from_le_bytes(buffer[offset..offset + 4].try_into().unwrap());
        offset += 4;

        if magic != VMPAK_MAGIC {
            return Err(io::Error::new(io::ErrorKind::InvalidData, "Invalid VMPAK magic number"));
        }

        let format_version = u16::from_le_bytes(buffer[offset..offset + 2].try_into().unwrap());
        offset += 2;

        let manager_version = u16::from_le_bytes(buffer[offset..offset + 2].try_into().unwrap());
        offset += 2;

        let index_table_offset = u64::from_le_bytes(buffer[offset..offset + 8].try_into().unwrap());
        offset += 8;

        let metadata_size = u64::from_le_bytes(buffer[offset..offset + 8].try_into().unwrap());
        offset += 8;

        let flags = buffer[offset];
        offset += 1;

        let reserved = buffer[offset];

        Ok(Self {
            magic,
            format_version,
            manager_version,
            index_table_offset,
            metadata_size,
            flags,
            reserved
        })
    }
}
