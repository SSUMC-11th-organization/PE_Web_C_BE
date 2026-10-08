package com.umc.study.service;

import com.umc.study.dto.BookResponse;
import com.umc.study.repository.BookJpaRepository;
import com.umc.study.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.umc.study.dto.CreateBookRequest;
import com.umc.study.entity.Book;
import com.umc.study.entity.Category;
import com.umc.study.repository.CategoryRepository;


import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BookService {

    // 3주차 JDBC Repository
    private final BookRepository bookRepository;

    // 4주차 JPA Repository
    private final BookJpaRepository bookJpaRepository;

    private final CategoryRepository categoryRepository;

    // 4주차 실습 1: ORM으로 전체 도서 조회
    @Transactional(readOnly = true)
    public List<BookResponse> getBooks() {
        return bookJpaRepository.findAllByOrderByBookIdDesc()
                .stream()
                .map(BookResponse::from)
                .toList();
    }

    // 기존 3주차 코드 유지
    public List<Map<String, Object>> getAllBooks() {
        return bookRepository.findAll();
    }

    public void createBook(Map<String, Object> body) {
        bookRepository.save(body);
    }

    public List<Map<String, Object>> getBooksByCategory(Long categoryId) {
        return bookRepository.findByCategoryId(categoryId);
    }

    @Transactional
    public void createBookWithJpa(CreateBookRequest request) {

        // 1. 요청한 카테고리가 DB에 존재하는지 확인
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() ->
                        new IllegalArgumentException("존재하지 않는 카테고리입니다.")
                );

        // 2. 요청 데이터를 Book 엔티티로 변환
        Book book = new Book(
                category,
                request.title(),
                request.description()
        );

        // 3. JPA를 이용해 DB에 저장
        bookJpaRepository.save(book);
    }
}