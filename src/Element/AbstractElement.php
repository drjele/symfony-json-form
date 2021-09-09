<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Element;

use Drjele\Symfony\JsonForm\Exception\Exception;

abstract class AbstractElement
{
    public const DATA_TYPE_INTEGER = 'integer';
    public const DATA_TYPE_STRING = 'string';
    public const DATA_TYPES = [
        self::DATA_TYPE_INTEGER,
        self::DATA_TYPE_STRING,
    ];

    public const MODE_SINGLE = 'single';
    public const MODE_MULTIPLE = 'multiple';
    public const MODES = [
        self::MODE_SINGLE,
        self::MODE_MULTIPLE,
    ];

    private string $name;
    private string $label;

    abstract public function render($data): array;

    abstract protected function getType(): string;

    final public function __construct(string $name, string $label)
    {
        $this->name = $name;
        $this->label = $label;
    }

    final public function getName(): ?string
    {
        return $this->name;
    }

    final protected function renderBase(): array
    {
        return [
            'type' => $this->getType(),
            'name' => $this->name,
            'label' => $this->label,
        ];
    }

    protected function throwInvalidValueException(string $message = null): void
    {
        if (null !== $message) {
            throw new Exception(
                \sprintf('invalid value for `%s` with type `%s`: %s', $this->name, $this->getType(), $message)
            );
        }

        throw new Exception(\sprintf('invalid value for `%s` with type `%s`', $this->name, $this->getType()));
    }
}
