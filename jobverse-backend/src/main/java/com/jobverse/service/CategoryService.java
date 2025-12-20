package com.jobverse.service;

import com.jobverse.dto.response.CategoryResponse;
import com.jobverse.entity.Category;
import com.jobverse.exception.ResourceNotFoundException;
import com.jobverse.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryResponse> getAllCategories() {
        log.info("📋 Fetching all active categories");

        List<Category> categories = categoryRepository.findAllActiveOrderByJobCount();

        log.info("✅ Found {} categories", categories.size());

        return categories.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public CategoryResponse getCategoryById(Long id) {
        log.info("🔍 Fetching category by ID: {}", id);

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        return mapToResponse(category);
    }

    public CategoryResponse getCategoryBySlug(String slug) {
        log.info("🔍 Fetching category by slug: {}", slug);

        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with slug: " + slug));

        return mapToResponse(category);
    }

    private CategoryResponse mapToResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .icon(category.getIcon())
                .description(category.getDescription())
                .jobCount(category.getJobCount())
                .isActive(category.getIsActive())
                .build();
    }
}
