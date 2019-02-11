package com.ab.test.service.mapper;

import com.ab.test.domain.*;
import com.ab.test.service.dto.FileDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity File and its DTO FileDTO.
 */
@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface FileMapper extends EntityMapper<FileDTO, File> {

    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "user.firstName", target = "userName")
    FileDTO toDto(File file);

    @Mapping(source = "userId", target = "user")
    File toEntity(FileDTO fileDTO);

    default File fromId(Long id) {
        if (id == null) {
            return null;
        }
        File file = new File();
        file.setId(id);
        return file;
    }
}
